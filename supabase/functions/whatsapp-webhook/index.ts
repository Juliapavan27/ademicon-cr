// Receives inbound WhatsApp messages from apps/whatsapp-connector (see ADR
// 0005) — plays the role the Meta Cloud API webhook would have played, so
// everything downstream (lead matching, AI orchestration, ai_decisions,
// conversation inbox) is transport-agnostic and stays put if the client ever
// migrates to the official Cloud API.
import { createClient } from "npm:@supabase/supabase-js@2.47.10";
import { generateReply, type ChatMessage } from "./ai.ts";
import { buildToolHandlers, TOOL_SCHEMAS } from "./tools.ts";

const ADEMICON_ORG_ID = "00000000-0000-0000-0000-000000000001";

const BASE_SYSTEM_PROMPT = `Você é a assistente comercial da Ademicon, uma corretora de consórcios. Você conversa com leads pelo WhatsApp.

Regras de tom:
- Fale como uma pessoa real do time comercial, nunca como um robô ou script.
- Use frases curtas, naturais, do jeito que se escreve no WhatsApp.
- Nunca comece frases com "Como assistente de IA" ou revele que é uma IA, a menos que perguntem diretamente.
- Seja calorosa e prestativa, sem ser insistente.

Seu trabalho:
- Entender o que o lead precisa (tipo de consórcio: imóvel, veículo, etc.).
- Responder objeções (preço, prazo, funcionamento do consórcio) com clareza.
- Classificar o lead conforme o engajamento e interesse demonstrado.
- Criar uma tarefa para um consultor humano quando a conversa exigir uma ação humana.
- Mover o lead no funil quando o estágio da conversa mudar claramente.
- Gerar um resumo quando a conversa ficar longa ou mudar de assunto relevante.

Se não tiver certeza sobre algo específico (valores exatos, prazos, condições contratuais), diga que vai confirmar com um consultor humano em vez de inventar informação.`;

function normalizePhone(raw: string): string {
  return raw.replace(/@s\.whatsapp\.net$/, "").replace(/\D/g, "");
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const expectedSecret = Deno.env.get("WHATSAPP_CONNECTOR_SECRET");
  const providedSecret = req.headers.get("x-connector-secret");
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const from = typeof body?.from === "string" ? normalizePhone(body.from) : null;
  const text = typeof body?.text === "string" ? body.text : null;

  if (!from || !text) {
    return new Response(JSON.stringify({ error: "Payload inválido: 'from' e 'text' são obrigatórios." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // 1. Find or create the lead by phone.
  let { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("organization_id", ADEMICON_ORG_ID)
    .eq("phone", from)
    .maybeSingle();

  if (!lead) {
    const { data: firstStage } = await supabase
      .from("pipeline_stages")
      .select("id")
      .eq("organization_id", ADEMICON_ORG_ID)
      .order("order_index")
      .limit(1)
      .maybeSingle();

    const { data: newLead, error: leadError } = await supabase
      .from("leads")
      .insert({
        organization_id: ADEMICON_ORG_ID,
        full_name: from,
        phone: from,
        source: "whatsapp",
        current_stage_id: firstStage?.id ?? null,
        consent_given_at: new Date().toISOString(),
        consent_source: "whatsapp_inbound",
      })
      .select("id")
      .single();
    if (leadError) throw leadError;
    lead = newLead;

    await supabase.from("lgpd_consents").insert({
      lead_id: lead!.id,
      consent_type: "comunicacao_whatsapp",
      granted_at: new Date().toISOString(),
      source: "whatsapp_inbound",
    });
  }

  const leadId = lead!.id;

  // 2. Find or create an open conversation for this lead.
  let { data: conversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("lead_id", leadId)
    .eq("channel", "whatsapp")
    .neq("status", "closed")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!conversation) {
    const { data: newConversation, error: conversationError } = await supabase
      .from("conversations")
      .insert({ lead_id: leadId, channel: "whatsapp", external_thread_id: from, status: "open" })
      .select("id")
      .single();
    if (conversationError) throw conversationError;
    conversation = newConversation;
  }

  const conversationId = conversation!.id;

  // 3. Record the inbound message.
  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    sender_type: "lead",
    content: text,
  });

  // 4. Build context from recent history.
  const { data: history } = await supabase
    .from("messages")
    .select("sender_type, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(20);

  const chatMessages: ChatMessage[] = (history ?? []).map((m) => ({
    role: m.sender_type === "lead" ? "user" : "assistant",
    content: m.content,
  }));

  // 5. Resolve provider metadata up front (same check ai.ts makes internally)
  // so tool-call ai_decisions rows can be tagged correctly.
  const hasAnthropicKey = Boolean(Deno.env.get("ANTHROPIC_API_KEY"));
  const llmProvider = hasAnthropicKey ? "anthropic" : "mock";
  const llmModel = hasAnthropicKey ? "claude-sonnet-4-5" : "mock-v1";

  const handlers = buildToolHandlers({
    supabase,
    leadId,
    conversationId,
    organizationId: ADEMICON_ORG_ID,
    llmProvider,
    llmModel,
  });

  const result = await generateReply(BASE_SYSTEM_PROMPT, chatMessages, [...TOOL_SCHEMAS], handlers);

  // 6. Record the outbound reply, log it as a feedback-able decision, and
  // update the conversation. Every AI reply gets a `reply` ai_decisions row
  // (not just tool calls) so the inbox can always attach thumbs up/down /
  // correction feedback to it — see migration 0015.
  const { data: outboundMessage } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      direction: "outbound",
      sender_type: "ai",
      content: result.text,
    })
    .select("id")
    .single();

  await supabase.from("ai_decisions").insert({
    conversation_id: conversationId,
    message_id: outboundMessage?.id,
    decision_type: "reply",
    input_context: { lastUserMessage: text },
    output_payload: { text: result.text },
    llm_provider: llmProvider,
    llm_model: llmModel,
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString(), status: "open" })
    .eq("id", conversationId);

  // 7. Ask the connector to actually deliver the reply over WhatsApp.
  const connectorUrl = Deno.env.get("WHATSAPP_CONNECTOR_URL");
  if (connectorUrl) {
    await fetch(`${connectorUrl}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-connector-secret": expectedSecret },
      body: JSON.stringify({ to: from, text: result.text }),
    }).catch((error) => console.error("Falha ao pedir envio ao connector:", error));
  } else {
    console.warn("WHATSAPP_CONNECTOR_URL não configurado — resposta gerada mas não enviada.");
  }

  return new Response(
    JSON.stringify({ leadId, conversationId, reply: result.text, toolCalls: result.toolCalls.length }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});

// Dispatches due, pending outreach_cadence_steps rows (see migration
// 00000000000019). Triggered manually by staff (a button in the app), not
// on an unattended schedule — a human stays in the loop for every batch,
// since this can eventually reach real WhatsApp sends once the connector is
// configured. Not part of the reactive whatsapp-webhook pipeline: this is
// the outbound side (cold cadence), that one is inbound.
import { createClient } from "npm:@supabase/supabase-js@2.47.10";

// Called directly from the browser via supabase.functions.invoke(), which
// preflights with an OPTIONS request — without these headers the browser
// blocks the real POST before it's ever sent.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: CORS_HEADERS });
  }

  const authHeader = req.headers.get("Authorization");
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader ?? "" } } },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401, headers: CORS_HEADERS });
  }

  const { data: roles } = await supabase.from("user_roles").select("roles(name)").eq("user_id", user.id);
  const isStaff = (roles ?? []).some((entry) => {
    const relation = entry.roles as { name: string } | { name: string }[] | null;
    if (!relation) return false;
    return Array.isArray(relation)
      ? relation.some((r) => r.name === "admin" || r.name === "gestor" || r.name === "secretaria")
      : relation.name === "admin" || relation.name === "gestor" || relation.name === "secretaria";
  });
  if (!isStaff) {
    return new Response(
      JSON.stringify({ error: "Apenas admin, gestor ou secretária podem processar a cadência." }),
      { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } },
    );
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: dueSteps, error: dueError } = await admin
    .from("outreach_cadence_steps")
    .select("id, lead_id, step_number, message_text")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("step_number", { ascending: true });
  if (dueError) throw dueError;
  if (!dueSteps || dueSteps.length === 0) {
    return new Response(JSON.stringify({ processed: 0, sent: 0, cancelled: 0 }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  const connectorUrl = Deno.env.get("WHATSAPP_CONNECTOR_URL");
  const connectorSecret = Deno.env.get("WHATSAPP_CONNECTOR_SECRET");

  let sent = 0;
  let cancelled = 0;

  for (const step of dueSteps) {
    // Stop the cadence the moment the lead has replied to anything — a
    // scripted follow-up after a real reply reads as not paying attention.
    const { data: conversation } = await admin
      .from("conversations")
      .select("id")
      .eq("lead_id", step.lead_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    let hasReplied = false;
    if (conversation) {
      const { data: inboundMessage } = await admin
        .from("messages")
        .select("id")
        .eq("conversation_id", conversation.id)
        .eq("direction", "inbound")
        .limit(1)
        .maybeSingle();
      hasReplied = Boolean(inboundMessage);
    }

    if (hasReplied) {
      await admin
        .from("outreach_cadence_steps")
        .update({ status: "cancelled" })
        .eq("lead_id", step.lead_id)
        .eq("status", "pending");
      cancelled++;
      continue;
    }

    const { data: lead } = await admin.from("leads").select("phone").eq("id", step.lead_id).single();

    let conversationId = conversation?.id;
    if (!conversationId) {
      const { data: newConversation, error: conversationError } = await admin
        .from("conversations")
        .insert({ lead_id: step.lead_id, channel: "whatsapp", status: "open", external_thread_id: lead?.phone ?? null })
        .select("id")
        .single();
      if (conversationError) throw conversationError;
      conversationId = newConversation.id;
    }

    const { data: outboundMessage, error: messageError } = await admin
      .from("messages")
      .insert({ conversation_id: conversationId, direction: "outbound", sender_type: "ai", content: step.message_text })
      .select("id")
      .single();
    if (messageError) throw messageError;

    await admin.from("ai_decisions").insert({
      conversation_id: conversationId,
      message_id: outboundMessage.id,
      decision_type: "reply",
      input_context: { trigger: "cadence_step", stepNumber: step.step_number },
      output_payload: { text: step.message_text },
      llm_provider: "mock",
      llm_model: "mock-v1",
    });

    await admin
      .from("conversations")
      .update({ last_message_at: new Date().toISOString(), status: "open" })
      .eq("id", conversationId);

    await admin
      .from("outreach_cadence_steps")
      .update({ status: "sent", sent_at: new Date().toISOString() })
      .eq("id", step.id);

    if (connectorUrl && connectorSecret && lead?.phone) {
      await fetch(`${connectorUrl}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-connector-secret": connectorSecret },
        body: JSON.stringify({ to: lead.phone, text: step.message_text }),
      }).catch((error) => console.error("Falha ao pedir envio ao connector:", error));
    }

    sent++;
  }

  return new Response(JSON.stringify({ processed: dueSteps.length, sent, cancelled }), {
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
});

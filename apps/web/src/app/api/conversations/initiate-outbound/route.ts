import { NextResponse } from "next/server";
import { z } from "zod";
import { ProviderFactory } from "@ademicon/ai-providers";
import { createClient } from "@/shared/lib/supabase/server";
import { SupabaseConversationsRepository } from "@/features/conversations/repository/supabase-conversations-repository";

const bodySchema = z.object({ leadId: z.string().uuid() });

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .select("full_name, phone")
    .eq("id", parsed.data.leadId)
    .single();
  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  }

  const repository = new SupabaseConversationsRepository(supabase);
  const conversationId = await repository.findOrCreateOutboundConversation(parsed.data.leadId, lead.phone);

  const provider = ProviderFactory.resolve({});
  const result = await provider.generateResponse({
    messages: [
      {
        role: "user",
        content: `Novo lead para iniciar contato: ${lead.full_name}. Nunca conversamos antes — inicie o primeiro contato de forma calorosa, se apresentando como time comercial da Ademicon.`,
      },
    ],
  });

  const messageId = await repository.insertMessage(conversationId, "outbound", "ai", result.text);
  await repository.insertAiDecision(
    conversationId,
    messageId,
    "reply",
    { trigger: "outbound_initiate", leadName: lead.full_name },
    { text: result.text },
  );

  return NextResponse.json({ conversationId, message: result.text });
}

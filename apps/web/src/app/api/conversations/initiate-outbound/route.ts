import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/shared/lib/supabase/server";
import { SupabaseConversationsRepository } from "@/features/conversations/repository/supabase-conversations-repository";
import { composeColdOutreachMessage } from "@/features/conversations/domain/cold-outreach";

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
    .select("full_name, phone, company")
    .eq("id", parsed.data.leadId)
    .single();
  if (leadError || !lead) {
    return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  }

  const repository = new SupabaseConversationsRepository(supabase);
  const conversationId = await repository.findOrCreateOutboundConversation(parsed.data.leadId, lead.phone);

  // A genuine cold opener, not a reactive reply: this lead never asked about
  // consórcio and has never talked to Ademicon, so the message must spark
  // curiosity rather than assume interest — see composeColdOutreachMessage.
  const text = composeColdOutreachMessage({ fullName: lead.full_name, company: lead.company });

  const messageId = await repository.insertMessage(conversationId, "outbound", "ai", text);
  await repository.insertAiDecision(
    conversationId,
    messageId,
    "reply",
    { trigger: "outbound_initiate", leadName: lead.full_name },
    { text },
  );

  return NextResponse.json({ conversationId, message: text });
}

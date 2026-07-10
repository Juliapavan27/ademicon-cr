import { NextResponse } from "next/server";
import { z } from "zod";
import { ProviderFactory } from "@ademicon/ai-providers";
import { createClient } from "@/shared/lib/supabase/server";
import { SupabaseConversationsRepository } from "@/features/conversations/repository/supabase-conversations-repository";
import { SupabaseAgendaRepository } from "@/features/agenda/repository/supabase-agenda-repository";

const bodySchema = z.object({
  conversationId: z.string().uuid(),
  leadId: z.string().uuid(),
  replyText: z.string().min(1),
});

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
  const { conversationId, leadId, replyText } = parsed.data;

  const conversationsRepo = new SupabaseConversationsRepository(supabase);
  const agendaRepo = new SupabaseAgendaRepository(supabase);

  await conversationsRepo.insertMessage(conversationId, "inbound", "lead", replyText);

  let scheduledAppointmentId: string | null = null;
  const provider = ProviderFactory.resolve({});
  const result = await provider.generateResponse({
    messages: [{ role: "user", content: replyText }],
    handlers: {
      schedule_meeting: async (args) => {
        const parsedArgs = args as { proposedDateTime: string; motivo: string };
        const appointment = await agendaRepo.scheduleAppointment(leadId, parsedArgs.proposedDateTime);
        scheduledAppointmentId = appointment.id;
        return appointment;
      },
    },
  });

  const outboundMessageId = await conversationsRepo.insertMessage(conversationId, "outbound", "ai", result.text);
  const decisionType = scheduledAppointmentId ? "schedule_meeting" : "reply";
  await conversationsRepo.insertAiDecision(
    conversationId,
    outboundMessageId,
    decisionType,
    { lastUserMessage: replyText },
    { text: result.text, toolCalls: result.toolCalls },
  );

  return NextResponse.json({ reply: result.text, appointmentId: scheduledAppointmentId });
}

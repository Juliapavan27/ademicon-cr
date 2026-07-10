-- Conversations/messages/ai_decisions previously had no INSERT policy for
-- authenticated staff — they were only ever written by the whatsapp-webhook
-- Edge Function via the service_role key. The outbound-contact and
-- simulate-reply demo flows insert these rows from an authenticated staff
-- session instead (standing in for the real WhatsApp round trip), so they
-- need their own scoped INSERT policies.

create policy "staff create conversations" on conversations
  for insert
  with check (
    exists (
      select 1 from leads l
      where l.id = conversations.lead_id
        and l.organization_id = private.get_user_organization(auth.uid())
        and (private.is_admin_or_gestor(auth.uid()) or private.user_has_role(auth.uid(), 'secretaria') or l.assigned_consultant_id = auth.uid())
    )
  );

create policy "staff simulate ai or lead messages" on messages
  for insert
  with check (
    sender_type in ('ai', 'lead')
    and exists (
      select 1 from conversations c
      join leads l on l.id = c.lead_id
      where c.id = messages.conversation_id
        and l.organization_id = private.get_user_organization(auth.uid())
        and (private.is_admin_or_gestor(auth.uid()) or private.user_has_role(auth.uid(), 'secretaria'))
    )
  );

create policy "staff create ai decisions" on ai_decisions
  for insert
  with check (
    exists (
      select 1 from conversations c
      join leads l on l.id = c.lead_id
      where c.id = ai_decisions.conversation_id
        and l.organization_id = private.get_user_organization(auth.uid())
        and (private.is_admin_or_gestor(auth.uid()) or private.user_has_role(auth.uid(), 'secretaria'))
    )
  );

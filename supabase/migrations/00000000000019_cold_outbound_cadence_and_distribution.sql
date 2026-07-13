-- Lead enrichment fields
alter table leads add column whatsapp_status text not null default 'not_checked';
alter table leads add constraint leads_whatsapp_status_check check (whatsapp_status = any (array['not_checked', 'valid', 'invalid']));
alter table leads add column suggested_approach text;

-- Appointments: consultant assignment becomes a separate, manual step (see
-- the new "Secretária" distribution page) instead of the AI picking any
-- available consultant automatically.
alter table appointments alter column consultant_id drop not null;

-- Cadence engine: multi-touch outbound sequence per lead. A scheduled
-- Edge Function (pg_cron + pg_net) dispatches due, pending steps; if the
-- lead replies at any point, remaining steps are cancelled.
create table outreach_cadence_steps (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads(id) on delete cascade,
  step_number integer not null,
  message_text text not null,
  scheduled_at timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status = any (array['pending', 'sent', 'skipped', 'cancelled'])),
  created_at timestamptz not null default now(),
  unique (lead_id, step_number)
);

alter table outreach_cadence_steps enable row level security;

create policy "cadence steps follow lead visibility" on outreach_cadence_steps
  for select
  using (
    exists (
      select 1 from leads l
      where l.id = outreach_cadence_steps.lead_id
        and l.organization_id = private.get_user_organization(auth.uid())
    )
  );

create policy "staff create cadence steps" on outreach_cadence_steps
  for insert
  with check (
    exists (
      select 1 from leads l
      where l.id = outreach_cadence_steps.lead_id
        and l.organization_id = private.get_user_organization(auth.uid())
        and (private.is_admin_or_gestor(auth.uid()) or private.user_has_role(auth.uid(), 'secretaria'))
    )
  );

create policy "staff update cadence steps" on outreach_cadence_steps
  for update
  using (
    exists (
      select 1 from leads l
      where l.id = outreach_cadence_steps.lead_id
        and l.organization_id = private.get_user_organization(auth.uid())
    )
  );

-- service_role (used by the scheduled dispatcher Edge Function) bypasses RLS by default, no extra policy needed.

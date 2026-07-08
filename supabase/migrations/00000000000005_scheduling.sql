-- Agenda: calendar integrations, appointments, reminders.

create table calendar_integrations (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants (user_id) on delete cascade,
  provider text not null check (provider in ('google', 'outlook', 'calendly')),
  external_account_id text,
  access_token text,
  refresh_token text,
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'error')),
  connected_at timestamptz not null default now()
);

create table appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  consultant_id uuid not null references consultants (user_id),
  scheduled_at timestamptz not null,
  duration_minutes integer not null default 30,
  status text not null default 'scheduled' check (
    status in ('scheduled', 'confirmed', 'rescheduled', 'completed', 'no_show', 'cancelled')
  ),
  meeting_link text,
  external_event_id text,
  source text not null default 'manual' check (source in ('ai_scheduled', 'manual', 'consultant_calendar')),
  created_at timestamptz not null default now()
);

create table appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments (id) on delete cascade,
  channel text not null check (channel in ('whatsapp', 'email')),
  scheduled_for timestamptz not null,
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed'))
);

create index idx_appointments_lead on appointments (lead_id);
create index idx_appointments_consultant on appointments (consultant_id);
create index idx_appointments_scheduled_at on appointments (scheduled_at);

alter table calendar_integrations enable row level security;
alter table appointments enable row level security;
alter table appointment_reminders enable row level security;

create policy "consultant reads own calendar integration"
  on calendar_integrations for select
  using (consultant_id = auth.uid() or is_admin_or_gestor(auth.uid()));

create policy "consultant manages own calendar integration"
  on calendar_integrations for all
  using (consultant_id = auth.uid() or is_admin_or_gestor(auth.uid()))
  with check (consultant_id = auth.uid() or is_admin_or_gestor(auth.uid()));

create policy "appointments readable by org role scope"
  on appointments for select
  using (
    exists (
      select 1 from leads l
      where l.id = appointments.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and (
        is_admin_or_gestor(auth.uid())
        or user_has_role(auth.uid(), 'secretaria')
        or appointments.consultant_id = auth.uid()
      )
    )
  );

create policy "staff create appointments"
  on appointments for insert
  with check (
    exists (
      select 1 from leads l
      where l.id = appointments.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "staff update appointments"
  on appointments for update
  using (
    consultant_id = auth.uid()
    or is_admin_or_gestor(auth.uid())
    or user_has_role(auth.uid(), 'secretaria')
  );

create policy "reminders follow appointment visibility"
  on appointment_reminders for select
  using (
    exists (
      select 1 from appointments a
      join leads l on l.id = a.lead_id
      where a.id = appointment_reminders.appointment_id
      and l.organization_id = get_user_organization(auth.uid())
      and (is_admin_or_gestor(auth.uid()) or a.consultant_id = auth.uid() or user_has_role(auth.uid(), 'secretaria'))
    )
  );

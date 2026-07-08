-- Distribuição Inteligente: queue, configurable weighting rules, and an
-- auditable snapshot of every decision (consultants will ask "why wasn't it
-- me", so every candidate evaluated is recorded, not just the winner).

create table consultant_queue (
  id uuid primary key default gen_random_uuid(),
  consultant_id uuid not null references consultants (user_id) on delete cascade,
  organization_id uuid not null references organizations (id),
  position_in_queue integer not null,
  entered_queue_at timestamptz not null default now(),
  is_available boolean not null default true,
  last_meeting_completed_at timestamptz,
  unique (consultant_id)
);

create table distribution_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  criteria_weights jsonb not null default '{
    "arrivalOrder": 0.2,
    "specialtyMatch": 0.3,
    "cityMatch": 0.2,
    "performance": 0.2,
    "currentLoad": 0.1
  }'::jsonb,
  is_active boolean not null default true,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create table distribution_decisions (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  consultant_id_chosen uuid references consultants (user_id),
  candidatos_avaliados jsonb not null default '[]'::jsonb,
  regra_aplicada_id uuid references distribution_rules (id),
  decided_at timestamptz not null default now()
);

create index idx_consultant_queue_organization on consultant_queue (organization_id);
create index idx_distribution_decisions_lead on distribution_decisions (lead_id);

alter table consultant_queue enable row level security;
alter table distribution_rules enable row level security;
alter table distribution_decisions enable row level security;

create policy "org members read consultant_queue"
  on consultant_queue for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "admin manages consultant_queue"
  on consultant_queue for all
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()))
  with check (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "org members read distribution_rules"
  on distribution_rules for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "admin manages distribution_rules"
  on distribution_rules for all
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()))
  with check (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "distribution_decisions follow lead visibility"
  on distribution_decisions for select
  using (
    exists (
      select 1 from leads l
      where l.id = distribution_decisions.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and (is_admin_or_gestor(auth.uid()) or l.assigned_consultant_id = auth.uid())
    )
  );

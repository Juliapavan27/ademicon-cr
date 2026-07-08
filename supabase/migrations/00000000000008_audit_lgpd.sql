-- Cross-cutting audit trail and LGPD compliance tables. Append-only by
-- design: no role (including admin) gets UPDATE/DELETE grants here, only
-- SELECT for admins and INSERT for the app/service layer.

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  actor_id uuid references profiles (id),
  actor_type text not null default 'user' check (actor_type in ('user', 'ai', 'system')),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_state jsonb,
  after_state jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now()
);

create table lgpd_consents (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  consent_type text not null check (consent_type in ('comunicacao_whatsapp', 'marketing')),
  granted_at timestamptz,
  revoked_at timestamptz,
  source text,
  ip_address text
);

create table lgpd_data_requests (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  request_type text not null check (request_type in ('access', 'deletion', 'portability')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'fulfilled', 'rejected')),
  requested_at timestamptz not null default now(),
  fulfilled_at timestamptz,
  fulfilled_by uuid references profiles (id)
);

create index idx_audit_logs_organization on audit_logs (organization_id);
create index idx_audit_logs_entity on audit_logs (entity_type, entity_id);
create index idx_lgpd_consents_lead on lgpd_consents (lead_id);
create index idx_lgpd_data_requests_lead on lgpd_data_requests (lead_id);

alter table audit_logs enable row level security;
alter table lgpd_consents enable row level security;
alter table lgpd_data_requests enable row level security;

create policy "admin reads audit_logs"
  on audit_logs for select
  using (is_admin(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "authenticated inserts audit_logs for own org"
  on audit_logs for insert
  with check (organization_id = get_user_organization(auth.uid()));

-- No update/delete policy exists for audit_logs: append-only, enforced by RLS
-- (no grant matches those commands) rather than by convention.

create policy "staff read lgpd_consents in org"
  on lgpd_consents for select
  using (
    exists (
      select 1 from leads l
      where l.id = lgpd_consents.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and (is_admin_or_gestor(auth.uid()) or user_has_role(auth.uid(), 'secretaria'))
    )
  );

create policy "staff insert lgpd_consents"
  on lgpd_consents for insert
  with check (
    exists (
      select 1 from leads l
      where l.id = lgpd_consents.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "admin reads lgpd_data_requests"
  on lgpd_data_requests for select
  using (
    exists (
      select 1 from leads l
      where l.id = lgpd_data_requests.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and is_admin(auth.uid())
    )
  );

create policy "admin manages lgpd_data_requests"
  on lgpd_data_requests for insert
  with check (
    exists (
      select 1 from leads l
      where l.id = lgpd_data_requests.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and is_admin(auth.uid())
    )
  );

create policy "admin updates lgpd_data_requests"
  on lgpd_data_requests for update
  using (
    exists (
      select 1 from leads l
      where l.id = lgpd_data_requests.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and is_admin(auth.uid())
    )
  );

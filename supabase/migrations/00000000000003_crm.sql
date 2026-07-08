-- CRM core: pipeline, leads, deals, notes/tags/attachments/tasks.

create table pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  name text not null,
  order_index integer not null,
  color text,
  is_won boolean not null default false,
  is_lost boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, order_index)
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  full_name text not null,
  email text,
  phone text,
  source text not null default 'manual' check (source in ('whatsapp', 'site', 'indicacao', 'manual')),
  specialty_id uuid references specialties (id),
  city_id uuid references cities (id),
  current_stage_id uuid references pipeline_stages (id),
  assigned_consultant_id uuid references consultants (user_id),
  lead_score integer not null default 0,
  status text not null default 'active' check (status in ('active', 'won', 'lost', 'archived')),
  consent_given_at timestamptz,
  consent_source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  organization_id uuid not null references organizations (id),
  valor_estimado numeric(14, 2),
  produto text,
  probabilidade numeric(5, 2),
  stage_id uuid references pipeline_stages (id),
  won_at timestamptz,
  lost_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default now()
);

create table lead_score_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  score_anterior integer not null,
  score_novo integer not null,
  motivo text not null,
  gerado_por text not null default 'system' check (gerado_por in ('ai', 'system', 'manual')),
  created_at timestamptz not null default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  name text not null,
  color text,
  unique (organization_id, name)
);

create table lead_tags (
  lead_id uuid not null references leads (id) on delete cascade,
  tag_id uuid not null references tags (id) on delete cascade,
  primary key (lead_id, tag_id)
);

create table notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  author_id uuid references profiles (id),
  content text not null,
  is_ai_generated boolean not null default false,
  created_at timestamptz not null default now()
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads (id) on delete cascade,
  uploaded_by uuid references profiles (id),
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  title text not null,
  description text,
  related_entity_type text check (related_entity_type in ('lead', 'deal', 'partner')),
  related_entity_id uuid,
  assigned_to uuid references profiles (id),
  due_date timestamptz,
  status text not null default 'pending' check (status in ('pending', 'done', 'overdue')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  created_by uuid references profiles (id),
  created_at timestamptz not null default now()
);

create index idx_leads_organization on leads (organization_id);
create index idx_leads_assigned_consultant on leads (assigned_consultant_id);
create index idx_leads_current_stage on leads (current_stage_id);
create index idx_deals_lead on deals (lead_id);
create index idx_notes_lead on notes (lead_id);
create index idx_attachments_lead on attachments (lead_id);
create index idx_tasks_organization on tasks (organization_id);
create index idx_tasks_assigned_to on tasks (assigned_to);

-- RLS

alter table pipeline_stages enable row level security;
alter table leads enable row level security;
alter table deals enable row level security;
alter table lead_score_history enable row level security;
alter table tags enable row level security;
alter table lead_tags enable row level security;
alter table notes enable row level security;
alter table attachments enable row level security;
alter table tasks enable row level security;

create policy "org members read pipeline_stages"
  on pipeline_stages for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "admin manages pipeline_stages"
  on pipeline_stages for all
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()))
  with check (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "leads readable by org role scope"
  on leads for select
  using (
    organization_id = get_user_organization(auth.uid())
    and (
      is_admin_or_gestor(auth.uid())
      or user_has_role(auth.uid(), 'secretaria')
      or assigned_consultant_id = auth.uid()
      or assigned_consultant_id is null
    )
  );

create policy "leads writable by org role scope"
  on leads for insert
  with check (organization_id = get_user_organization(auth.uid()));

create policy "leads updatable by owner or staff"
  on leads for update
  using (
    organization_id = get_user_organization(auth.uid())
    and (
      is_admin_or_gestor(auth.uid())
      or user_has_role(auth.uid(), 'secretaria')
      or assigned_consultant_id = auth.uid()
    )
  );

create policy "admin deletes leads"
  on leads for delete
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "deals follow parent lead visibility"
  on deals for select
  using (
    exists (
      select 1 from leads l
      where l.id = deals.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and (
        is_admin_or_gestor(auth.uid())
        or user_has_role(auth.uid(), 'secretaria')
        or l.assigned_consultant_id = auth.uid()
        or l.assigned_consultant_id is null
      )
    )
  );

create policy "deals writable by staff"
  on deals for insert
  with check (organization_id = get_user_organization(auth.uid()));

create policy "deals updatable by staff"
  on deals for update
  using (
    organization_id = get_user_organization(auth.uid())
    and (
      is_admin_or_gestor(auth.uid())
      or exists (
        select 1 from leads l
        where l.id = deals.lead_id and l.assigned_consultant_id = auth.uid()
      )
    )
  );

create policy "admin deletes deals"
  on deals for delete
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "lead_score_history follows lead visibility"
  on lead_score_history for select
  using (
    exists (
      select 1 from leads l
      where l.id = lead_score_history.lead_id
      and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "system inserts lead_score_history"
  on lead_score_history for insert
  with check (
    exists (
      select 1 from leads l
      where l.id = lead_score_history.lead_id
      and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "org members read tags"
  on tags for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "staff manage tags"
  on tags for insert
  with check (organization_id = get_user_organization(auth.uid()));

create policy "staff update tags"
  on tags for update
  using (organization_id = get_user_organization(auth.uid()));

create policy "admin delete tags"
  on tags for delete
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "lead_tags follow lead visibility"
  on lead_tags for select
  using (
    exists (
      select 1 from leads l
      where l.id = lead_tags.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "staff manage lead_tags"
  on lead_tags for all
  using (
    exists (
      select 1 from leads l
      where l.id = lead_tags.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  )
  with check (
    exists (
      select 1 from leads l
      where l.id = lead_tags.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "notes follow lead visibility"
  on notes for select
  using (
    exists (
      select 1 from leads l
      where l.id = notes.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "staff create notes"
  on notes for insert
  with check (
    exists (
      select 1 from leads l
      where l.id = notes.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "author or admin update notes"
  on notes for update
  using (author_id = auth.uid() or is_admin_or_gestor(auth.uid()));

create policy "author or admin delete notes"
  on notes for delete
  using (author_id = auth.uid() or is_admin_or_gestor(auth.uid()));

create policy "attachments follow lead visibility"
  on attachments for select
  using (
    lead_id is null
    or exists (
      select 1 from leads l
      where l.id = attachments.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "staff upload attachments"
  on attachments for insert
  with check (
    lead_id is null
    or exists (
      select 1 from leads l
      where l.id = attachments.lead_id and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "uploader or admin delete attachments"
  on attachments for delete
  using (uploaded_by = auth.uid() or is_admin_or_gestor(auth.uid()));

create policy "org members read tasks"
  on tasks for select
  using (
    organization_id = get_user_organization(auth.uid())
    and (is_admin_or_gestor(auth.uid()) or user_has_role(auth.uid(), 'secretaria') or assigned_to = auth.uid())
  );

create policy "staff create tasks"
  on tasks for insert
  with check (organization_id = get_user_organization(auth.uid()));

create policy "assignee or staff update tasks"
  on tasks for update
  using (
    organization_id = get_user_organization(auth.uid())
    and (assigned_to = auth.uid() or is_admin_or_gestor(auth.uid()) or user_has_role(auth.uid(), 'secretaria'))
  );

create policy "admin delete tasks"
  on tasks for delete
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

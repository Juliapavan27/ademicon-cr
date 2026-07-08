-- IA Comercial / conversations. Tables exist from Fase 0 so `leads`/`tasks`
-- relationships are correct; the WhatsApp integration and orchestrator that
-- populate them ship in Fase 4.

create table conversations (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references leads (id) on delete cascade,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'webchat')),
  external_thread_id text,
  status text not null default 'open' check (status in ('open', 'stalled', 'closed', 'handed_off')),
  last_message_at timestamptz,
  assigned_consultant_id uuid references consultants (user_id),
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  direction text not null check (direction in ('inbound', 'outbound')),
  sender_type text not null check (sender_type in ('lead', 'ai', 'human_agent')),
  content text not null,
  content_type text not null default 'text' check (content_type in ('text', 'image', 'document', 'audio')),
  external_message_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table ai_prompt_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  segment text not null,
  template_content text not null,
  version integer not null default 1,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table ai_decisions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  message_id uuid references messages (id),
  decision_type text not null check (
    decision_type in ('classify_lead', 'create_task', 'update_stage', 'schedule_meeting', 'summarize', 'handoff_human')
  ),
  input_context jsonb not null default '{}'::jsonb,
  output_payload jsonb not null default '{}'::jsonb,
  llm_provider text,
  llm_model text,
  confidence_score numeric(5, 4),
  created_at timestamptz not null default now()
);

create table ai_learning_feedback (
  id uuid primary key default gen_random_uuid(),
  ai_decision_id uuid not null references ai_decisions (id) on delete cascade,
  feedback_type text not null check (feedback_type in ('thumbs_up', 'thumbs_down', 'correction')),
  corrected_by uuid references profiles (id),
  correction_payload jsonb,
  created_at timestamptz not null default now()
);

create table conversation_summaries (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  summary_text text not null,
  generated_at timestamptz not null default now(),
  generated_by_model text
);

create index idx_conversations_lead on conversations (lead_id);
create index idx_conversations_status on conversations (status);
create index idx_messages_conversation on messages (conversation_id);
create index idx_ai_decisions_conversation on ai_decisions (conversation_id);
create index idx_ai_prompt_templates_org_segment on ai_prompt_templates (organization_id, segment);

-- RLS

alter table conversations enable row level security;
alter table messages enable row level security;
alter table ai_prompt_templates enable row level security;
alter table ai_decisions enable row level security;
alter table ai_learning_feedback enable row level security;
alter table conversation_summaries enable row level security;

create policy "conversations follow lead visibility"
  on conversations for select
  using (
    exists (
      select 1 from leads l
      where l.id = conversations.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and (
        is_admin_or_gestor(auth.uid())
        or user_has_role(auth.uid(), 'secretaria')
        or l.assigned_consultant_id = auth.uid()
        or l.assigned_consultant_id is null
      )
    )
  );

create policy "staff update conversations"
  on conversations for update
  using (
    exists (
      select 1 from leads l
      where l.id = conversations.lead_id
      and l.organization_id = get_user_organization(auth.uid())
      and (
        is_admin_or_gestor(auth.uid())
        or user_has_role(auth.uid(), 'secretaria')
        or l.assigned_consultant_id = auth.uid()
      )
    )
  );

create policy "messages follow conversation visibility"
  on messages for select
  using (
    exists (
      select 1 from conversations c
      join leads l on l.id = c.lead_id
      where c.id = messages.conversation_id
      and l.organization_id = get_user_organization(auth.uid())
      and (
        is_admin_or_gestor(auth.uid())
        or user_has_role(auth.uid(), 'secretaria')
        or l.assigned_consultant_id = auth.uid()
        or l.assigned_consultant_id is null
      )
    )
  );

create policy "staff send outbound messages"
  on messages for insert
  with check (
    sender_type = 'human_agent'
    and exists (
      select 1 from conversations c
      join leads l on l.id = c.lead_id
      where c.id = messages.conversation_id
      and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "org members read prompt templates"
  on ai_prompt_templates for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "admin manages prompt templates"
  on ai_prompt_templates for insert
  with check (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "admin updates prompt templates"
  on ai_prompt_templates for update
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "ai_decisions follow conversation visibility"
  on ai_decisions for select
  using (
    exists (
      select 1 from conversations c
      join leads l on l.id = c.lead_id
      where c.id = ai_decisions.conversation_id
      and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "staff record ai feedback"
  on ai_learning_feedback for insert
  with check (
    exists (
      select 1 from ai_decisions d
      join conversations c on c.id = d.conversation_id
      join leads l on l.id = c.lead_id
      where d.id = ai_learning_feedback.ai_decision_id
      and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "ai_learning_feedback follows decision visibility"
  on ai_learning_feedback for select
  using (
    exists (
      select 1 from ai_decisions d
      join conversations c on c.id = d.conversation_id
      join leads l on l.id = c.lead_id
      where d.id = ai_learning_feedback.ai_decision_id
      and l.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "conversation_summaries follow conversation visibility"
  on conversation_summaries for select
  using (
    exists (
      select 1 from conversations c
      join leads l on l.id = c.lead_id
      where c.id = conversation_summaries.conversation_id
      and l.organization_id = get_user_organization(auth.uid())
    )
  );

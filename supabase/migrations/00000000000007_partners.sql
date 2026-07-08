-- Parceiros: cadastro, indicações, comissões e ranking.

create table partners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  user_id uuid references profiles (id),
  full_name text not null,
  tipo text not null default 'pessoa_fisica' check (tipo in ('pessoa_fisica', 'juridica')),
  email text,
  phone text,
  bank_info jsonb,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now()
);

create table referrals (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,
  lead_id uuid not null references leads (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'converted', 'lost')),
  created_at timestamptz not null default now()
);

create table commissions (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,
  deal_id uuid not null references deals (id) on delete cascade,
  valor numeric(14, 2) not null,
  percentual numeric(5, 2),
  status text not null default 'pending' check (status in ('pending', 'approved', 'paid')),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_partners_organization on partners (organization_id);
create index idx_referrals_partner on referrals (partner_id);
create index idx_commissions_partner on commissions (partner_id);

alter table partners enable row level security;
alter table referrals enable row level security;
alter table commissions enable row level security;

create policy "admin reads all partners"
  on partners for select
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "partner reads own record"
  on partners for select
  using (user_id = auth.uid());

create policy "admin manages partners"
  on partners for insert
  with check (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "admin updates partners"
  on partners for update
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "admin reads all referrals"
  on referrals for select
  using (
    exists (
      select 1 from partners p
      where p.id = referrals.partner_id
      and (is_admin_or_gestor(auth.uid()) and p.organization_id = get_user_organization(auth.uid()))
    )
  );

create policy "partner reads own referrals"
  on referrals for select
  using (
    exists (select 1 from partners p where p.id = referrals.partner_id and p.user_id = auth.uid())
  );

create policy "staff create referrals"
  on referrals for insert
  with check (
    exists (
      select 1 from partners p
      where p.id = referrals.partner_id and p.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "admin reads all commissions"
  on commissions for select
  using (
    exists (
      select 1 from partners p
      where p.id = commissions.partner_id
      and (is_admin_or_gestor(auth.uid()) and p.organization_id = get_user_organization(auth.uid()))
    )
  );

create policy "partner reads own commissions"
  on commissions for select
  using (
    exists (select 1 from partners p where p.id = commissions.partner_id and p.user_id = auth.uid())
  );

create policy "admin manages commissions"
  on commissions for insert
  with check (
    exists (
      select 1 from partners p
      where p.id = commissions.partner_id
      and is_admin_or_gestor(auth.uid())
      and p.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "admin updates commissions"
  on commissions for update
  using (
    exists (
      select 1 from partners p
      where p.id = commissions.partner_id
      and is_admin_or_gestor(auth.uid())
      and p.organization_id = get_user_organization(auth.uid())
    )
  );

-- partner_rankings is recalculated periodically (Fase 7 job), not derived via
-- a live view, so ranking snapshots stay stable for period-over-period reports.
create table partner_rankings (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references partners (id) on delete cascade,
  periodo text not null,
  total_indicacoes integer not null default 0,
  total_convertidas integer not null default 0,
  total_comissao numeric(14, 2) not null default 0,
  rank_position integer,
  calculated_at timestamptz not null default now(),
  unique (partner_id, periodo)
);

alter table partner_rankings enable row level security;

create policy "admin reads all partner_rankings"
  on partner_rankings for select
  using (
    exists (
      select 1 from partners p
      where p.id = partner_rankings.partner_id
      and is_admin_or_gestor(auth.uid())
      and p.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "partner reads own ranking"
  on partner_rankings for select
  using (
    exists (select 1 from partners p where p.id = partner_rankings.partner_id and p.user_id = auth.uid())
  );

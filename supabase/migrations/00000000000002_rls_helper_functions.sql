-- Helper functions used by every RLS policy in the platform. Centralizing
-- role/organization lookups here means the access-control logic is defined
-- once and audited once, instead of being re-implemented ad-hoc per policy.

create function get_user_organization(uid uuid)
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from profiles where id = uid;
$$;

create function user_has_role(uid uuid, role_name text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from user_roles ur
    join roles r on r.id = ur.role_id
    where ur.user_id = uid and r.name = role_name
  );
$$;

create function is_admin(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select user_has_role(uid, 'admin');
$$;

create function is_admin_or_gestor(uid uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select user_has_role(uid, 'admin') or user_has_role(uid, 'gestor');
$$;

-- RLS on identity/RBAC tables themselves.
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table roles enable row level security;
alter table user_roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table cities enable row level security;
alter table specialties enable row level security;
alter table consultants enable row level security;
alter table consultant_specialties enable row level security;

create policy "org members read own organization"
  on organizations for select
  using (id = get_user_organization(auth.uid()));

create policy "org members read profiles in org"
  on profiles for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "users update own profile"
  on profiles for update
  using (id = auth.uid());

create policy "admin manages profiles in org"
  on profiles for all
  using (is_admin(auth.uid()) and organization_id = get_user_organization(auth.uid()))
  with check (is_admin(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "authenticated read roles catalog"
  on roles for select
  to authenticated
  using (true);

create policy "org members read user_roles in org"
  on user_roles for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "admin manages user_roles in org"
  on user_roles for all
  using (is_admin(auth.uid()) and organization_id = get_user_organization(auth.uid()))
  with check (is_admin(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "authenticated read permissions catalog"
  on permissions for select
  to authenticated
  using (true);

create policy "authenticated read role_permissions catalog"
  on role_permissions for select
  to authenticated
  using (true);

create policy "admin manages role_permissions"
  on role_permissions for insert
  with check (is_admin(auth.uid()));

create policy "admin updates role_permissions"
  on role_permissions for update
  using (is_admin(auth.uid()));

create policy "admin deletes role_permissions"
  on role_permissions for delete
  using (is_admin(auth.uid()));

create policy "authenticated read cities"
  on cities for select
  to authenticated
  using (true);

create policy "org members read specialties in org"
  on specialties for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "admin manages specialties"
  on specialties for insert
  with check (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "admin updates specialties"
  on specialties for update
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "admin deletes specialties"
  on specialties for delete
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "org members read consultants in org"
  on consultants for select
  using (organization_id = get_user_organization(auth.uid()));

create policy "consultant updates own record"
  on consultants for update
  using (user_id = auth.uid() or is_admin_or_gestor(auth.uid()));

create policy "admin manages consultants"
  on consultants for insert
  with check (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "admin deletes consultants"
  on consultants for delete
  using (is_admin_or_gestor(auth.uid()) and organization_id = get_user_organization(auth.uid()));

create policy "org members read consultant_specialties"
  on consultant_specialties for select
  using (
    exists (
      select 1 from consultants c
      where c.user_id = consultant_specialties.consultant_id
      and c.organization_id = get_user_organization(auth.uid())
    )
  );

create policy "admin manages consultant_specialties"
  on consultant_specialties for all
  using (is_admin_or_gestor(auth.uid()))
  with check (is_admin_or_gestor(auth.uid()));

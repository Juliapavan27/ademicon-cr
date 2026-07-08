-- Identity, organization and RBAC foundation.
-- Single-organization deployment today ("Ademicon"), but organization_id is
-- present on every tenant-scoped table so multi-tenant expansion later is a
-- data change, not a schema migration.

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid not null references organizations (id),
  full_name text not null,
  email text not null,
  phone text,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (name in ('admin', 'gestor', 'consultor', 'secretaria', 'parceiro')),
  description text
);

create table user_roles (
  user_id uuid not null references profiles (id) on delete cascade,
  role_id uuid not null references roles (id) on delete cascade,
  organization_id uuid not null references organizations (id),
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table permissions (
  id uuid primary key default gen_random_uuid(),
  resource text not null,
  action text not null,
  description text,
  unique (resource, action)
);

create table role_permissions (
  role_id uuid not null references roles (id) on delete cascade,
  permission_id uuid not null references permissions (id) on delete cascade,
  primary key (role_id, permission_id)
);

create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text not null,
  region text,
  unique (name, state)
);

create table specialties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations (id),
  name text not null,
  unique (organization_id, name)
);

create table consultants (
  user_id uuid primary key references profiles (id) on delete cascade,
  organization_id uuid not null references organizations (id),
  city_id uuid references cities (id),
  status text not null default 'ausente' check (status in ('livre', 'ocupado', 'ausente')),
  max_carga_diaria integer not null default 5,
  performance_score numeric(5, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table consultant_specialties (
  consultant_id uuid not null references consultants (user_id) on delete cascade,
  specialty_id uuid not null references specialties (id) on delete cascade,
  primary key (consultant_id, specialty_id)
);

create index idx_profiles_organization on profiles (organization_id);
create index idx_user_roles_user on user_roles (user_id);
create index idx_consultants_organization on consultants (organization_id);
create index idx_consultants_city on consultants (city_id);

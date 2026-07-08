-- Reference/catalog data: the single Ademicon organization, the fixed role
-- catalog, a starter permission matrix, and a default pipeline. All of this
-- is configuration, not environment-specific test data, so it ships as a
-- migration (applies identically to every environment) rather than seed.sql.

insert into organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'Ademicon', 'ademicon');

insert into roles (name, description) values
  ('admin', 'Acesso total à organização'),
  ('gestor', 'Visão ampla de gestão, sem administração de usuários'),
  ('consultor', 'Atua nos próprios leads, tarefas e agenda'),
  ('secretaria', 'Visão operacional ampla: conversas, agenda e consultores'),
  ('parceiro', 'Acesso restrito às próprias indicações e comissões');

insert into permissions (resource, action) values
  ('leads', 'read'), ('leads', 'write'), ('leads', 'delete'),
  ('deals', 'read'), ('deals', 'write'), ('deals', 'delete'),
  ('tasks', 'read'), ('tasks', 'write'), ('tasks', 'delete'),
  ('conversations', 'read'), ('conversations', 'write'),
  ('appointments', 'read'), ('appointments', 'write'), ('appointments', 'delete'),
  ('consultants', 'read'), ('consultants', 'write'),
  ('partners', 'read'), ('partners', 'write'),
  ('referrals', 'read'), ('referrals', 'write'),
  ('commissions', 'read'), ('commissions', 'approve'),
  ('users', 'read'), ('users', 'write'), ('users', 'delete'),
  ('roles', 'read'), ('roles', 'write'),
  ('audit_logs', 'read'),
  ('distribution_rules', 'read'), ('distribution_rules', 'write'),
  ('dashboard', 'read');

-- admin: every permission.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p where r.name = 'admin';

-- gestor: read everything, write on operational resources, no user/role management.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'gestor'
and (
  p.action = 'read'
  or (p.resource in ('leads', 'deals', 'tasks', 'appointments', 'consultants', 'partners', 'distribution_rules') and p.action = 'write')
);

-- consultor: own-scope read/write on leads/deals/tasks/conversations/appointments (RLS narrows to "own").
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'consultor'
and p.resource in ('leads', 'deals', 'tasks', 'conversations', 'appointments', 'dashboard')
and p.action in ('read', 'write');

-- secretaria: broad operational read, write on tasks/appointments/conversations.
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'secretaria'
and (
  (p.resource in ('leads', 'conversations', 'consultants', 'appointments', 'dashboard') and p.action = 'read')
  or (p.resource in ('tasks', 'appointments', 'conversations') and p.action = 'write')
);

-- parceiro: read-only on own referrals/commissions (RLS narrows to own partner record).
insert into role_permissions (role_id, permission_id)
select r.id, p.id from roles r, permissions p
where r.name = 'parceiro'
and p.resource in ('referrals', 'commissions')
and p.action = 'read';

insert into pipeline_stages (organization_id, name, order_index, color, is_won, is_lost) values
  ('00000000-0000-0000-0000-000000000001', 'Novo Lead', 1, '#005DAA', false, false),
  ('00000000-0000-0000-0000-000000000001', 'Em Qualificação', 2, '#F59E0B', false, false),
  ('00000000-0000-0000-0000-000000000001', 'Reunião Agendada', 3, '#003B71', false, false),
  ('00000000-0000-0000-0000-000000000001', 'Proposta Enviada', 4, '#005DAA', false, false),
  ('00000000-0000-0000-0000-000000000001', 'Ganho', 5, '#22C55E', true, false),
  ('00000000-0000-0000-0000-000000000001', 'Perdido', 6, '#EF4444', false, true);

insert into distribution_rules (organization_id, is_active) values
  ('00000000-0000-0000-0000-000000000001', true);

-- Migration 0010 moved these functions to `private` but left their
-- search_path as just `public`. is_admin/is_admin_or_gestor call
-- user_has_role() internally by unqualified name, which Postgres now fails
-- to resolve since `private` isn't in their search_path — surfaced as
-- "function user_has_role(uuid, unknown) does not exist" on any write that
-- goes through an is_admin()-gated policy (e.g. inserting into user_roles).

alter function private.is_admin(uuid) set search_path = private, public;
alter function private.is_admin_or_gestor(uuid) set search_path = private, public;

-- RLS helper functions are SECURITY DEFINER by necessity (they bypass RLS to
-- avoid recursive policy evaluation on profiles/user_roles). That makes them
-- flagged by the security linter when left in `public`, since PostgREST
-- auto-exposes every public-schema function as a callable RPC endpoint
-- (e.g. /rest/v1/rpc/is_admin with an arbitrary uid). Moving them to a
-- `private` schema removes that RPC surface; existing RLS policies keep
-- working unchanged because Postgres resolves policy expressions by function
-- OID, not by schema-qualified name, so no policy needs to be recreated.

create schema if not exists private;

alter function public.get_user_organization(uuid) set schema private;
alter function public.user_has_role(uuid, text) set schema private;
alter function public.is_admin(uuid) set schema private;
alter function public.is_admin_or_gestor(uuid) set schema private;

revoke all on schema private from public, anon, authenticated;

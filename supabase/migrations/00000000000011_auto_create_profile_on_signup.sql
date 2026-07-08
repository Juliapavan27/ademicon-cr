-- Every Supabase Auth user needs a matching `profiles` row for the app to
-- work (RLS, role lookups, the dashboard shell all key off it). Without this
-- trigger, a user who signs up via Supabase Auth would authenticate
-- successfully but the app would treat them as profile-less and redirect
-- oddly. organization_id defaults to the single Ademicon org for now —
-- correct for the current single-tenant deployment; multi-tenant signup
-- would replace this with an invite-token lookup.

create function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, organization_id, full_name, email)
  values (
    new.id,
    '00000000-0000-0000-0000-000000000001',
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

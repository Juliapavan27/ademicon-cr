-- Storage bucket for lead attachments. Path convention is
-- `{organization_id}/{lead_id}/{filename}` so RLS can scope access by
-- organization using storage.foldername() without duplicating the full
-- lead-visibility logic that already exists on the `attachments` table.

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', false);

create policy "org members read attachments in own org folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (private.get_user_organization(auth.uid()))::text
  );

create policy "org members upload attachments in own org folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (private.get_user_organization(auth.uid()))::text
  );

create policy "org members delete attachments in own org folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'attachments'
    and (storage.foldername(name))[1] = (private.get_user_organization(auth.uid()))::text
  );

alter table leads drop constraint leads_source_check;
alter table leads add constraint leads_source_check check (source = any (array['whatsapp', 'site', 'indicacao', 'manual', 'import']));

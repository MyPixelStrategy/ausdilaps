-- Adds the "Inquiry Type" branch fields to leads, mirroring the dynamic
-- quote form (New Quote / Access Letter / Report Inquiry / General Inquiry).
-- IDEMPOTENT: safe to run repeatedly.

alter table public.leads add column if not exists inquiry_type text;
alter table public.leads add column if not exists property_role text;
alter table public.leads add column if not exists project_number text;
alter table public.leads add column if not exists document_id text;
alter table public.leads add column if not exists contact_address text;
alter table public.leads add column if not exists contact_method text[];

create index if not exists leads_inquiry_type_idx on public.leads(inquiry_type);

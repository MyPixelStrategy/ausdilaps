-- AusDilaps core schema — leads, organisations, roles, projects, reports.
-- Org-based 3-tier access: superadmin → admin (internal) → client_admin / client_member.
-- All privileged writes happen server-side via the service-role key (bypasses RLS);
-- no INSERT/UPDATE policies are granted to anon/authenticated by design.

create extension if not exists pgcrypto;

-- ── Enums ──────────────────────────────────────────────────────────────
create type user_role     as enum ('superadmin', 'admin', 'client_admin', 'client_member');
create type org_type      as enum ('internal', 'client');
create type lead_tier     as enum ('tier1', 'tier2', 'residential', 'unclassified');
create type lead_status   as enum ('new', 'contacted', 'quoted', 'won', 'lost', 'spam');
create type report_status as enum ('draft', 'awaiting_release', 'released');

-- ── updated_at helper ──────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- ── organizations ──────────────────────────────────────────────────────
create table public.organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  type       org_type not null default 'client',
  abn        text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger trg_org_updated before update on public.organizations
  for each row execute function public.set_updated_at();

-- ── profiles (1:1 with auth.users) ─────────────────────────────────────
create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  org_id     uuid references public.organizations(id) on delete set null,
  role       user_role not null default 'client_member',
  full_name  text,
  email      text,
  phone      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.profiles(org_id);
create trigger trg_profile_updated before update on public.profiles
  for each row execute function public.set_updated_at();

-- Helper functions — SECURITY DEFINER so RLS policies don't recurse on profiles.
create or replace function public.auth_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select org_id from public.profiles where id = auth.uid();
$$;
create or replace function public.is_internal()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('superadmin', 'admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ── projects ───────────────────────────────────────────────────────────
create table public.projects (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  name       text not null,
  location   text,
  sector     text,
  status     text not null default 'active',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.projects(org_id);
create trigger trg_project_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- ── reports ────────────────────────────────────────────────────────────
create table public.reports (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  title        text not null,
  report_type  text,                         -- pre / post / structural / capture / ...
  r2_key       text not null,                -- object key in the private Cloudflare R2 bucket
  file_name    text,
  file_size    bigint,
  content_type text,
  version      int not null default 1,
  status       report_status not null default 'awaiting_release',
  released_at  timestamptz,
  released_by  uuid references public.profiles(id),
  uploaded_by  uuid references public.profiles(id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index on public.reports(project_id);
create index on public.reports(status);
create trigger trg_report_updated before update on public.reports
  for each row execute function public.set_updated_at();

-- ── report_access_log (audit — matters for a dispute-defence product) ───
create table public.report_access_log (
  id          uuid primary key default gen_random_uuid(),
  report_id   uuid not null references public.reports(id) on delete cascade,
  accessed_by uuid references public.profiles(id),
  action      text not null default 'download',
  ip          text,
  user_agent  text,
  created_at  timestamptz not null default now()
);
create index on public.report_access_log(report_id);

-- ── leads (quote/contact submissions) ──────────────────────────────────
create table public.leads (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  -- contact
  name              text not null,
  role              text,
  company           text,
  email             text not null,
  phone             text,
  -- project / qualification
  project_name      text,
  project_location  text,
  adjoining_count   int,
  required_start    date,
  da_condition_ref  text,
  notes             text,
  -- classification & routing
  tier              lead_tier not null default 'unclassified',
  routing           text,
  source_page       text,
  -- integrations
  salesforce_id     text,
  salesforce_synced boolean not null default false,
  sync_error        text,
  emailed           boolean not null default false,
  -- audit
  ip                text,
  user_agent        text,
  status            lead_status not null default 'new'
);
create index on public.leads(created_at desc);
create index on public.leads(tier);
create index on public.leads(salesforce_synced) where salesforce_synced = false;

-- ── Row Level Security ──────────────────────────────────────────────────
alter table public.organizations     enable row level security;
alter table public.profiles          enable row level security;
alter table public.projects          enable row level security;
alter table public.reports           enable row level security;
alter table public.report_access_log enable row level security;
alter table public.leads             enable row level security;

-- profiles: own profile; internal staff see all
create policy "profiles self read"   on public.profiles for select
  using (id = auth.uid() or public.is_internal());
create policy "profiles self update" on public.profiles for update
  using (id = auth.uid());

-- organizations: internal all; clients see only their own org
create policy "orgs read" on public.organizations for select
  using (public.is_internal() or id = public.auth_org_id());

-- projects: internal all; clients see only their org's projects
create policy "projects read" on public.projects for select
  using (public.is_internal() or org_id = public.auth_org_id());

-- reports: internal all; clients see ONLY released reports in their org's projects
create policy "reports read" on public.reports for select
  using (
    public.is_internal()
    or (
      status = 'released'
      and exists (
        select 1 from public.projects p
        where p.id = reports.project_id and p.org_id = public.auth_org_id()
      )
    )
  );

-- access log: internal read all; clients read their own actions
create policy "access log read" on public.report_access_log for select
  using (public.is_internal() or accessed_by = auth.uid());

-- leads: internal read only; no client/anon access (writes via service-role)
create policy "leads internal read" on public.leads for select
  using (public.is_internal());

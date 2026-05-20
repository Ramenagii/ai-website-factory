create table if not exists sites (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  title text,
  industry text,
  generated_at timestamptz not null default now()
);

create table if not exists patterns (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete cascade,
  hero_type text,
  pricing_style text,
  conversion_pattern text,
  section_flow jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references sites(id) on delete set null,
  repo_url text,
  deployment_url text,
  prompt jsonb,
  project_manifest jsonb,
  created_at timestamptz not null default now()
);

-- ─── Projects ────────────────────────────────────────────────────────────────

create table if not exists projects (
  id          serial primary key,
  slug        text unique not null,
  title       text not null,
  tagline     text not null,
  type        text not null,
  tech        text[] not null default '{}',
  color       text not null default '#F5C542',
  featured    boolean not null default false,
  role        text not null default '',
  context     text not null default '',
  problem     text not null default '',
  solution    text not null default '',
  outcome     text not null default '',
  created_at  timestamptz default now()
);

alter table projects enable row level security;

create policy "Public can read projects"
  on projects for select using (true);

create policy "Authenticated can update projects"
  on projects for update using (auth.role() = 'authenticated');

create policy "Authenticated can insert projects"
  on projects for insert with check (auth.role() = 'authenticated');

create policy "Authenticated can delete projects"
  on projects for delete using (auth.role() = 'authenticated');

-- ─── Profile ─────────────────────────────────────────────────────────────────

create table if not exists profile (
  id        serial primary key,
  name      text not null,
  title     text not null,
  tagline   text not null,
  about     text[] not null default '{}',
  skills    text[] not null default '{}',
  email     text not null default '',
  github    text not null default '',
  linkedin  text not null default ''
);

alter table profile enable row level security;

create policy "Public can read profile"
  on profile for select using (true);

create policy "Authenticated can update profile"
  on profile for update using (auth.role() = 'authenticated');
-- Media fields migration (add to existing projects table)
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS mockup_type TEXT DEFAULT 'desktop',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS live_url TEXT;
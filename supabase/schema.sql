-- Sarac Ramsay dashboard: Supabase schema.
-- Run this once in Supabase: SQL Editor, New query, paste, Run.

-- 1. Who may use the app. Only emails in this table can read or write anything.
create table if not exists allowed_users (email text primary key);
insert into allowed_users (email) values ('matt@welcometoimf.com') on conflict do nothing;
-- insert into allowed_users (email) values ('josh@example.com');   -- add Josh here

create or replace function is_allowed() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from allowed_users where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));
$$;

-- 2. Data. Each row is one task, one calendar event or one notification.
--    "data" holds the whole object as JSON, so new fields never need a migration.
create table if not exists tasks  (id text primary key, data jsonb not null, deleted boolean not null default false, updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table if not exists events (id text primary key, data jsonb not null, deleted boolean not null default false, updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
create table if not exists notifs (id text primary key, data jsonb not null, deleted boolean not null default false, updated_at timestamptz not null default now(), updated_by uuid default auth.uid());
-- Everything else: clients, automation rules, results, id counter.
create table if not exists kv (key text primary key, value jsonb not null, updated_at timestamptz not null default now(), updated_by uuid default auth.uid());

create or replace function touch_updated() returns trigger language plpgsql as $$
begin new.updated_at = now(); new.updated_by = coalesce(auth.uid(), new.updated_by); return new; end $$;
do $$ declare t text; begin
  foreach t in array array['tasks','events','notifs','kv'] loop
    execute format('drop trigger if exists touch on %I', t);
    execute format('create trigger touch before insert or update on %I for each row execute function touch_updated()', t);
  end loop; end $$;

-- 3. Google Calendar link. Tokens are only readable by the server functions (service role).
create table if not exists google_tokens   (user_id uuid primary key references auth.users on delete cascade, refresh_token text not null, google_email text, connected_at timestamptz default now());
create table if not exists google_accounts (user_id uuid primary key references auth.users on delete cascade, google_email text, connected_at timestamptz default now(), last_sync timestamptz);
create table if not exists gcal_links (
  user_id uuid not null references auth.users on delete cascade,
  kind text not null check (kind in ('task','event')),
  local_id text not null, gcal_id text not null,
  g_updated text, synced_at timestamptz default now(),
  primary key (user_id, kind, local_id));
create index if not exists gcal_links_g on gcal_links (user_id, gcal_id);

-- 4. Row level security
alter table allowed_users enable row level security;
alter table tasks enable row level security;  alter table events enable row level security;
alter table notifs enable row level security; alter table kv enable row level security;
alter table google_tokens enable row level security; alter table google_accounts enable row level security;
alter table gcal_links enable row level security;
do $$ declare t text; begin
  foreach t in array array['tasks','events','notifs','kv'] loop
    execute format('drop policy if exists team_all on %I', t);
    execute format('create policy team_all on %I for all to authenticated using (is_allowed()) with check (is_allowed())', t);
  end loop; end $$;
drop policy if exists own_account on google_accounts;
create policy own_account on google_accounts for select to authenticated using (user_id = auth.uid() and is_allowed());
-- allowed_users, google_tokens and gcal_links have no policies: only the server (service role) can touch them.

-- 5. Live updates between Matt and Josh
do $$ declare t text; begin
  foreach t in array array['tasks','events','notifs','kv','google_accounts'] loop
    begin execute format('alter publication supabase_realtime add table %I', t); exception when duplicate_object then null; end;
  end loop; end $$;

-- ===== Accounts, profiles and Google push (added later, safe to run again) =====
-- Anyone with an email on one of these domains may sign in, as well as the exact emails in allowed_users.
create table if not exists allowed_domains (domain text primary key);
insert into allowed_domains (domain) values ('welcometoimf.com'), ('saracramsay.com') on conflict do nothing;
alter table allowed_domains enable row level security;

create or replace function is_allowed() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from allowed_users where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
      or exists (select 1 from allowed_domains where lower(domain) = lower(split_part(coalesce(auth.jwt() ->> 'email', ''), '@', 2)));
$$;

create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  email text not null, username text not null, avatar text, color text,
  created_at timestamptz default now(), updated_at timestamptz default now());
create unique index if not exists profiles_username_key on profiles (lower(username));
alter table profiles enable row level security;
drop policy if exists profiles_read on profiles;  create policy profiles_read on profiles for select to authenticated using (is_allowed());
drop policy if exists profiles_ins on profiles;   create policy profiles_ins on profiles for insert to authenticated with check (is_allowed() and user_id = auth.uid());
drop policy if exists profiles_upd on profiles;   create policy profiles_upd on profiles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table google_accounts add column if not exists name text;
alter table google_accounts add column if not exists tz text;
create table if not exists gcal_channels (channel_id text primary key, user_id uuid not null references auth.users on delete cascade, resource_id text, expiration timestamptz not null);
alter table gcal_channels enable row level security;   -- server only

do $$ begin
  begin alter publication supabase_realtime add table profiles; exception when duplicate_object then null; end;
end $$;

-- ===== Settings, claimed placeholder tasks, team Google list (added later, safe to run again) =====
alter table profiles add column if not exists claimed text;   -- 'Matt' or 'Josh' when a new user takes over the starter tasks
-- every signed in team member can see who has Google connected (email only, never tokens)
drop policy if exists own_account on google_accounts;
drop policy if exists team_read_accounts on google_accounts;
create policy team_read_accounts on google_accounts for select to authenticated using (is_allowed());

-- ===== Several Google accounts per person, sync lock, error messages (added later, safe to run again) =====
update google_tokens   set google_email = '' where google_email is null;
update google_accounts set google_email = '' where google_email is null;
alter table google_tokens   alter column google_email set default '';
alter table google_tokens   alter column google_email set not null;
alter table google_accounts alter column google_email set default '';
alter table google_accounts alter column google_email set not null;
do $$ begin
  if (select count(*) from pg_index i where i.indrelid = 'google_tokens'::regclass and i.indisprimary and i.indnatts = 1) = 1 then
    alter table google_tokens drop constraint google_tokens_pkey;
    alter table google_tokens add primary key (user_id, google_email);
  end if;
  if (select count(*) from pg_index i where i.indrelid = 'google_accounts'::regclass and i.indisprimary and i.indnatts = 1) = 1 then
    alter table google_accounts drop constraint google_accounts_pkey;
    alter table google_accounts add primary key (user_id, google_email);
  end if;
end $$;
alter table google_accounts add column if not exists is_primary boolean not null default false;
alter table google_accounts add column if not exists sync_lock timestamptz;
alter table google_accounts add column if not exists last_error text;
update google_accounts a set is_primary = true
  from (select distinct on (user_id) user_id, google_email from google_accounts order by user_id, connected_at) f
  where a.user_id = f.user_id and a.google_email = f.google_email
    and not exists (select 1 from google_accounts b where b.user_id = a.user_id and b.is_primary);
alter table gcal_links    add column if not exists account text not null default '';
alter table gcal_channels add column if not exists account text not null default '';

-- ===== Sales page data (build 1105d, safe to run again) =====
-- The Sales page used to keep everything in one open Firebase document. It now lives here,
-- behind the same login as the rest of Eclipse. One row per lead, per Apollo contact,
-- per call week and so on, so two people editing different things never overwrite each other.
create table if not exists sales_rows (
  key text primary key,
  value jsonb not null,
  deleted boolean not null default false,
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid());
-- Backups of the whole Sales data, newest 40 kept by the app.
create table if not exists sales_snapshots (
  id bigint primary key,
  summary text not null default '',
  data jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid());
drop trigger if exists touch on sales_rows;
create trigger touch before insert or update on sales_rows for each row execute function touch_updated();
alter table sales_rows enable row level security;
alter table sales_snapshots enable row level security;
drop policy if exists team_all on sales_rows;
create policy team_all on sales_rows for all to authenticated using (is_allowed()) with check (is_allowed());
drop policy if exists team_all on sales_snapshots;
create policy team_all on sales_snapshots for all to authenticated using (is_allowed()) with check (is_allowed());
do $$ begin
  begin execute 'alter publication supabase_realtime add table sales_rows'; exception when duplicate_object then null; end;
end $$;

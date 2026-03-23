-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — High Priestess Tier
--  Migration: 010_high_priestess.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Extend the subscription_tier enum
alter type subscription_tier add value if not exists 'high_priestess';

-- ─── GUIDE PROFILES ──────────────────────────────────────────────────────────
-- Extended profile for High Priestess (Guide) users

create table if not exists guide_profiles (
  id uuid primary key references users(id) on delete cascade,
  business_name text,
  tagline text,
  specialties text[] default '{}',
  bio text,
  website_url text,
  client_slots integer not null default 3,
  clients_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table guide_profiles enable row level security;

create policy "Guide manages own profile"
  on guide_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Anyone authenticated reads guide profiles"
  on guide_profiles for select
  using (auth.uid() is not null);

-- ─── GUIDE CLIENT CONNECTIONS ─────────────────────────────────────────────────
-- Links a Guide to each of their clients

create table if not exists guide_client_connections (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references users(id) on delete cascade,
  client_user_id uuid references users(id) on delete set null, -- null until accepted
  client_email text not null,
  client_name text,
  client_birth_date date,
  client_birth_time time,
  client_birth_city text,
  client_notes text,                    -- private; only Guide sees
  status text not null default 'pending'
    check (status in ('pending', 'active', 'archived')),
  invite_token text unique,             -- 32-char random token
  invite_sent_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists guide_client_connections_guide
  on guide_client_connections(guide_id, status);
create index if not exists guide_client_connections_token
  on guide_client_connections(invite_token);
create index if not exists guide_client_connections_client_user
  on guide_client_connections(client_user_id);

alter table guide_client_connections enable row level security;

-- Guide owns full CRUD
create policy "Guide manages own connections"
  on guide_client_connections for all
  using (auth.uid() = guide_id)
  with check (auth.uid() = guide_id);

-- Client can read their own connection
create policy "Client reads own connection"
  on guide_client_connections for select
  using (auth.uid() = client_user_id);

-- ─── GUIDE READINGS ──────────────────────────────────────────────────────────
-- Custom readings/reports a Guide sends to a client

create table if not exists guide_readings (
  id uuid primary key default gen_random_uuid(),
  guide_id uuid not null references users(id) on delete cascade,
  client_connection_id uuid not null references guide_client_connections(id) on delete cascade,
  title text not null,
  reading_type text not null default 'custom'
    check (reading_type in ('custom', 'love_forecast', 'year_ahead', 'natal_summary', 'transit_report', 'monthly')),
  content text not null,
  is_published boolean not null default false,
  is_archived boolean not null default false,
  client_viewed_at timestamptz,         -- null until client opens it
  created_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists guide_readings_guide
  on guide_readings(guide_id, created_at desc);
create index if not exists guide_readings_connection
  on guide_readings(client_connection_id, is_published);

alter table guide_readings enable row level security;

-- Guide CRUD
create policy "Guide manages own readings"
  on guide_readings for all
  using (auth.uid() = guide_id)
  with check (auth.uid() = guide_id);

-- Client reads published readings for their connection
create policy "Client reads published readings"
  on guide_readings for select
  using (
    is_published = true
    and exists (
      select 1 from guide_client_connections gcc
      where gcc.id = guide_readings.client_connection_id
      and gcc.client_user_id = auth.uid()
    )
  );

-- ─── TRIGGERS ─────────────────────────────────────────────────────────────────

-- Auto-increment clients_count when a connection becomes active
create or replace function increment_guide_clients_count()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'active' and (old.status is null or old.status != 'active') then
    update guide_profiles
    set clients_count = clients_count + 1
    where id = new.guide_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_connection_activate on guide_client_connections;
create trigger on_connection_activate
  after insert or update of status on guide_client_connections
  for each row execute function increment_guide_clients_count();

-- Auto-decrement when connection is archived
create or replace function decrement_guide_clients_count()
returns trigger language plpgsql security definer as $$
begin
  if new.status = 'archived' and old.status = 'active' then
    update guide_profiles
    set clients_count = greatest(0, clients_count - 1)
    where id = new.guide_id;
  end if;
  return new;
end;
$$;

drop trigger if exists on_connection_archive on guide_client_connections;
create trigger on_connection_archive
  after update of status on guide_client_connections
  for each row execute function decrement_guide_clients_count();

-- Auto-create guide_profile when user upgrades to high_priestess
create or replace function create_guide_profile_on_upgrade()
returns trigger language plpgsql security definer as $$
begin
  if new.subscription_tier = 'high_priestess'
     and (old.subscription_tier is null or old.subscription_tier != 'high_priestess') then
    insert into guide_profiles (id)
    values (new.id)
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_user_high_priestess_upgrade on users;
create trigger on_user_high_priestess_upgrade
  after update of subscription_tier on users
  for each row execute function create_guide_profile_on_upgrade();

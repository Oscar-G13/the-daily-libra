-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Initial Schema
--  Migration: 001_initial_schema.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── ENUMS ───────────────────────────────────────────────────────────────────

create type subscription_tier as enum ('free', 'premium');
create type reading_category as enum (
  'daily', 'weekly', 'monthly', 'love', 'friendship', 'career',
  'confidence', 'healing', 'decision', 'shadow', 'beauty', 'compatibility', 'custom'
);
create type reading_tone as enum (
  'gentle', 'blunt', 'poetic', 'practical', 'seductive'
);
create type relationship_type as enum (
  'romantic', 'friendship', 'coworker', 'ex', 'crush', 'family'
);
create type libra_archetype as enum (
  'velvet_diplomat', 'romantic_strategist', 'mirror_heart', 'silent_scales',
  'golden_idealist', 'aesthetic_oracle', 'people_pleaser_in_recovery',
  'elegant_overthinker', 'soft_power_libra', 'cosmic_charmer'
);
create type archetype_modifier as enum (
  'venus_heavy', 'emotionally_guarded', 'harmony_seeking', 'validation_driven',
  'deeply_intuitive', 'detached_under_pressure', 'beauty_obsessed', 'indecisive_but_insightful'
);
create type aesthetic_style as enum (
  'soft_luxe', 'dark_romance', 'celestial_editorial', 'clean_goddess',
  'velvet_minimalism', 'modern_venus'
);

-- ─── USERS (extends auth.users) ──────────────────────────────────────────────

create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  display_name text,
  pronouns text,
  subscription_tier subscription_tier not null default 'free',
  tone_preference reading_tone default 'gentle',
  relationship_status text,
  goals text[] default '{}',
  onboarding_completed boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── BIRTH PROFILES ──────────────────────────────────────────────────────────

create table public.birth_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  birth_date date not null,
  birth_time time,
  birth_city text not null,
  birth_country text not null,
  timezone text not null,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  natal_chart_json jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── ONBOARDING RESPONSES ────────────────────────────────────────────────────

create table public.onboarding_responses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  question_id text not null,
  answer_value text not null,
  answer_label text,
  created_at timestamptz not null default now(),
  unique (user_id, question_id)
);

-- ─── LIBRA PROFILES ──────────────────────────────────────────────────────────

create table public.libra_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  primary_archetype libra_archetype not null,
  secondary_modifier archetype_modifier,
  aesthetic_style aesthetic_style,
  relationship_style text,
  conflict_style text,
  decision_style text,
  beauty_affinity text,
  emotional_pattern_summary text,
  ai_memory_summary text,
  quiz_scores jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── DAILY READINGS ──────────────────────────────────────────────────────────

create table public.daily_readings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  category reading_category not null default 'daily',
  tone reading_tone not null default 'gentle',
  prompt_context_json jsonb,
  output_text text not null,
  reading_date date not null default current_date,
  saved_to_journal boolean default false,
  created_at timestamptz not null default now()
);

create index idx_daily_readings_user_date on public.daily_readings(user_id, reading_date desc);

-- ─── COMPATIBILITY REPORTS ───────────────────────────────────────────────────

create table public.compatibility_reports (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  partner_name text not null,
  partner_birth_data_json jsonb not null,
  relationship_type relationship_type not null default 'romantic',
  report_json jsonb not null,
  created_at timestamptz not null default now()
);

-- ─── JOURNAL ENTRIES ─────────────────────────────────────────────────────────

create table public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  title text,
  body text not null,
  mood_tag text,
  mood_score smallint check (mood_score between 1 and 10),
  linked_reading_id uuid references public.daily_readings(id) on delete set null,
  ai_summary text,
  entry_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_journal_entries_user on public.journal_entries(user_id, entry_date desc);

-- ─── MOOD LOGS ───────────────────────────────────────────────────────────────

create table public.mood_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  mood_score smallint check (mood_score between 1 and 10),
  confidence_score smallint check (confidence_score between 1 and 10),
  social_energy_score smallint check (social_energy_score between 1 and 10),
  romantic_energy_score smallint check (romantic_energy_score between 1 and 10),
  stress_score smallint check (stress_score between 1 and 10),
  self_worth_score smallint check (self_worth_score between 1 and 10),
  notes text,
  log_date date not null default current_date,
  created_at timestamptz not null default now()
);

create unique index idx_mood_logs_user_date on public.mood_logs(user_id, log_date);

-- ─── RITUALS ─────────────────────────────────────────────────────────────────

create table public.rituals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  ritual_date date not null default current_date,
  ritual_json jsonb not null,
  completion_status boolean default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index idx_rituals_user_date on public.rituals(user_id, ritual_date);

-- ─── AI MEMORY ───────────────────────────────────────────────────────────────

create table public.ai_memory (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  memory_type text not null, -- 'pattern', 'concern', 'preference', 'event'
  content text not null,
  embedding vector(1536), -- for pgvector similarity search (optional)
  created_at timestamptz not null default now()
);

create index idx_ai_memory_user on public.ai_memory(user_id, created_at desc);

-- ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  provider text not null default 'stripe',
  status text not null default 'inactive', -- active, inactive, trialing, past_due, canceled
  plan_name text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

alter table public.users enable row level security;
alter table public.birth_profiles enable row level security;
alter table public.onboarding_responses enable row level security;
alter table public.libra_profiles enable row level security;
alter table public.daily_readings enable row level security;
alter table public.compatibility_reports enable row level security;
alter table public.journal_entries enable row level security;
alter table public.mood_logs enable row level security;
alter table public.rituals enable row level security;
alter table public.ai_memory enable row level security;
alter table public.subscriptions enable row level security;

-- Users: select/update own row
create policy "users_select_own" on public.users for select using (auth.uid() = id);
create policy "users_update_own" on public.users for update using (auth.uid() = id);
create policy "users_insert_own" on public.users for insert with check (auth.uid() = id);

-- Birth profiles
create policy "birth_profiles_own" on public.birth_profiles for all using (auth.uid() = user_id);

-- Onboarding responses
create policy "onboarding_own" on public.onboarding_responses for all using (auth.uid() = user_id);

-- Libra profiles
create policy "libra_profiles_own" on public.libra_profiles for all using (auth.uid() = user_id);

-- Daily readings
create policy "readings_own" on public.daily_readings for all using (auth.uid() = user_id);

-- Compatibility reports
create policy "compatibility_own" on public.compatibility_reports for all using (auth.uid() = user_id);

-- Journal entries
create policy "journal_own" on public.journal_entries for all using (auth.uid() = user_id);

-- Mood logs
create policy "mood_own" on public.mood_logs for all using (auth.uid() = user_id);

-- Rituals
create policy "rituals_own" on public.rituals for all using (auth.uid() = user_id);

-- AI memory
create policy "ai_memory_own" on public.ai_memory for all using (auth.uid() = user_id);

-- Subscriptions
create policy "subscriptions_own" on public.subscriptions for all using (auth.uid() = user_id);

-- ─── FUNCTIONS ───────────────────────────────────────────────────────────────

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at before update on public.users
  for each row execute procedure public.set_updated_at();
create trigger set_birth_profiles_updated_at before update on public.birth_profiles
  for each row execute procedure public.set_updated_at();
create trigger set_libra_profiles_updated_at before update on public.libra_profiles
  for each row execute procedure public.set_updated_at();
create trigger set_journal_updated_at before update on public.journal_entries
  for each row execute procedure public.set_updated_at();
create trigger set_subscriptions_updated_at before update on public.subscriptions
  for each row execute procedure public.set_updated_at();

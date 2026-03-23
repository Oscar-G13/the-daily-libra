-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Assessment System Schema
--  Migration 002
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Enums ───────────────────────────────────────────────────────────────────

create type assessment_question_type as enum (
  'likert',
  'forced_choice',
  'ranking',
  'scenario_choice'
);

create type assessment_session_status as enum (
  'in_progress',
  'completed',
  'abandoned'
);

-- ─── Reference Tables ─────────────────────────────────────────────────────────

create table assessment_versions (
  id            uuid primary key default gen_random_uuid(),
  version_name  text not null,
  description   text,
  is_active     boolean not null default false,
  created_at    timestamptz not null default now()
);

create table assessment_sections (
  id            uuid primary key default gen_random_uuid(),
  version_id    uuid not null references assessment_versions(id) on delete cascade,
  key           text not null,
  title         text not null,
  subtitle      text,
  description   text,
  sort_order    integer not null,
  section_theme text,
  unique(version_id, key)
);

create table assessment_questions (
  id            uuid primary key default gen_random_uuid(),
  version_id    uuid not null references assessment_versions(id) on delete cascade,
  section_id    uuid not null references assessment_sections(id) on delete cascade,
  key           text not null,
  prompt        text not null,
  help_text     text,
  question_type assessment_question_type not null,
  is_required   boolean not null default true,
  sort_order    integer not null,
  visual_style  text,
  metadata      jsonb,
  unique(version_id, key)
);

create table assessment_options (
  id            uuid primary key default gen_random_uuid(),
  question_id   uuid not null references assessment_questions(id) on delete cascade,
  value_key     text not null,
  label         text not null,
  numeric_value numeric(4,2) not null default 0,
  sort_order    integer not null,
  metadata      jsonb,
  unique(question_id, value_key)
);

create table assessment_trait_map (
  id              uuid primary key default gen_random_uuid(),
  question_id     uuid not null references assessment_questions(id) on delete cascade,
  option_value_key text not null,
  trait_key       text not null,
  weight          numeric(4,2) not null default 1.0,
  reverse_scored  boolean not null default false,
  notes           text
);

-- ─── User Tables ──────────────────────────────────────────────────────────────

create table user_assessment_sessions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references public.users(id) on delete cascade,
  version_id          uuid not null references assessment_versions(id),
  status              assessment_session_status not null default 'in_progress',
  started_at          timestamptz not null default now(),
  completed_at        timestamptz,
  current_section_id  uuid references assessment_sections(id),
  current_question_id uuid references assessment_questions(id),
  progress_percent    numeric(5,2) not null default 0,
  last_saved_at       timestamptz not null default now()
);

create table user_assessment_answers (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references user_assessment_sessions(id) on delete cascade,
  user_id           uuid not null references public.users(id) on delete cascade,
  question_id       uuid not null references assessment_questions(id),
  selected_option_id uuid references assessment_options(id),
  numeric_response  numeric(4,2),
  rank_response     jsonb,
  answered_at       timestamptz not null default now()
);

create table user_profile_traits (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.users(id) on delete cascade,
  version_id       uuid not null references assessment_versions(id),
  trait_key        text not null,
  raw_score        numeric(8,4),
  normalized_score numeric(5,2) not null default 0,
  percentile_band  text,
  confidence_score numeric(4,2),
  updated_at       timestamptz not null default now()
);

create table user_profile_summary (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references public.users(id) on delete cascade,
  version_id         uuid not null references assessment_versions(id),
  archetype_label    text,
  archetype_subtitle text,
  profile_summary    text,
  relational_summary text,
  emotional_summary  text,
  ritual_summary     text,
  ai_interpretation  jsonb,
  prompt_profile     jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table ai_personalization_memory (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references public.users(id) on delete cascade,
  profile_snapshot       jsonb,
  system_prompt_fragment text,
  tone_rules             jsonb,
  content_preferences    jsonb,
  updated_at             timestamptz not null default now(),
  unique(user_id)
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────

-- autosave upsert key
create unique index idx_answers_session_question
  on user_assessment_answers(session_id, question_id);

-- resume query
create index idx_sessions_user_status
  on user_assessment_sessions(user_id, status, started_at desc);

-- trait lookup + upsert
create unique index idx_traits_user_key
  on user_profile_traits(user_id, trait_key, version_id);

-- one profile summary per user per version
create unique index idx_profile_summary_user_version
  on user_profile_summary(user_id, version_id);

-- section ordering
create index idx_sections_version_order
  on assessment_sections(version_id, sort_order);

-- question ordering
create index idx_questions_section_order
  on assessment_questions(section_id, sort_order);

-- options ordering
create index idx_options_question_order
  on assessment_options(question_id, sort_order);

-- trait map lookup
create index idx_trait_map_question
  on assessment_trait_map(question_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────

-- Reference tables: read-only for authenticated users
alter table assessment_versions enable row level security;
create policy "assessment_versions_read" on assessment_versions
  for select using (auth.role() = 'authenticated');

alter table assessment_sections enable row level security;
create policy "assessment_sections_read" on assessment_sections
  for select using (auth.role() = 'authenticated');

alter table assessment_questions enable row level security;
create policy "assessment_questions_read" on assessment_questions
  for select using (auth.role() = 'authenticated');

alter table assessment_options enable row level security;
create policy "assessment_options_read" on assessment_options
  for select using (auth.role() = 'authenticated');

alter table assessment_trait_map enable row level security;
create policy "assessment_trait_map_read" on assessment_trait_map
  for select using (auth.role() = 'authenticated');

-- User tables: full access to own rows
alter table user_assessment_sessions enable row level security;
create policy "sessions_own" on user_assessment_sessions
  for all using (auth.uid() = user_id);

alter table user_assessment_answers enable row level security;
create policy "answers_own" on user_assessment_answers
  for all using (auth.uid() = user_id);

alter table user_profile_traits enable row level security;
create policy "traits_own" on user_profile_traits
  for all using (auth.uid() = user_id);

alter table user_profile_summary enable row level security;
create policy "profile_summary_own" on user_profile_summary
  for all using (auth.uid() = user_id);

alter table ai_personalization_memory enable row level security;
create policy "personalization_own" on ai_personalization_memory
  for all using (auth.uid() = user_id);

-- ─── Updated_at triggers ─────────────────────────────────────────────────────

create trigger set_profile_summary_updated_at
  before update on user_profile_summary
  for each row execute procedure set_updated_at();

create trigger set_personalization_updated_at
  before update on ai_personalization_memory
  for each row execute procedure set_updated_at();

create trigger set_profile_traits_updated_at
  before update on user_profile_traits
  for each row execute procedure set_updated_at();

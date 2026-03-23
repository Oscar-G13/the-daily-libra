-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Insight Quiz Sessions
--  Migration: 006_insight_quiz.sql
-- ─────────────────────────────────────────────────────────────────────────────

create table public.quiz_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  -- Generated questions: [{id, question, area, why}]
  questions_json jsonb not null default '[]',
  -- Collected answers: [{id, question, answer}]
  answers_json jsonb,
  -- Full streaming analysis text
  analysis_text text,
  -- Extracted key insights: [{insight, area}]
  insights_json jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_quiz_sessions_user on public.quiz_sessions(user_id, created_at desc);

alter table public.quiz_sessions enable row level security;
create policy "quiz_sessions_own" on public.quiz_sessions for all using (auth.uid() = user_id);

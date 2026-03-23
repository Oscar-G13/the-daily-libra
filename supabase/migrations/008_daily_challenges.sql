-- Daily challenges system
-- Challenges rotate daily (seeded by date), users complete them for XP

create table if not exists daily_challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  challenge_key text not null,         -- e.g. "2024-03-20_journal"
  challenge_date date not null,        -- the date this challenge belongs to
  xp_awarded integer not null default 0,
  completed_at timestamptz not null default now(),
  unique(user_id, challenge_key)
);

-- Index for fast lookup
create index if not exists daily_challenge_completions_user_date
  on daily_challenge_completions(user_id, challenge_date);

-- RLS
alter table daily_challenge_completions enable row level security;

create policy "Users manage own completions"
  on daily_challenge_completions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

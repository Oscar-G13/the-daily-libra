-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Profile Extensions, Referrals, Push Notifications
--  Migration: 007_profiles_referrals.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Extend users table ──────────────────────────────────────────────────────

alter table public.users
  add column if not exists avatar_url text,
  add column if not exists profile_bio text,
  add column if not exists profile_public boolean not null default false,
  add column if not exists referral_code text unique,
  add column if not exists referred_by uuid references public.users(id) on delete set null,
  add column if not exists referral_count integer not null default 0,
  add column if not exists push_subscription jsonb;

-- ─── Referral code generation function ──────────────────────────────────────

create or replace function public.generate_referral_code()
returns text
language plpgsql
as $$
declare
  chars text := 'abcdefghjkmnpqrstuvwxyz23456789';
  code text := '';
  i integer;
  exists_check integer;
begin
  loop
    code := '';
    for i in 1..8 loop
      code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    end loop;
    select count(*) into exists_check from public.users where referral_code = code;
    exit when exists_check = 0;
  end loop;
  return code;
end;
$$;

-- ─── Auto-assign referral code on user insert ────────────────────────────────

create or replace function public.assign_referral_code()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.referral_code is null then
    new.referral_code := public.generate_referral_code();
  end if;
  return new;
end;
$$;

create trigger on_user_created_assign_referral
  before insert on public.users
  for each row execute procedure public.assign_referral_code();

-- ─── Increment referral count when referred_by is set ────────────────────────

create or replace function public.increment_referral_count()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.referred_by is not null and (old.referred_by is null or old.referred_by != new.referred_by) then
    update public.users
      set referral_count = referral_count + 1
      where id = new.referred_by;
  end if;
  return new;
end;
$$;

create trigger on_user_referred
  after update of referred_by on public.users
  for each row execute procedure public.increment_referral_count();

-- ─── Index for referral code lookups ─────────────────────────────────────────

create index if not exists idx_users_referral_code on public.users(referral_code);
create index if not exists idx_users_referred_by on public.users(referred_by);

-- ─── Public profile read policy (for invite pages) ───────────────────────────

-- Allow anyone to read limited public profile data by referral_code
create policy "users_read_public_profile" on public.users
  for select
  using (profile_public = true or auth.uid() = id);

-- Revoke the overly broad select policy and replace it
-- (The original policy only allows own row; add public profile access)
drop policy if exists "users_select_own" on public.users;
create policy "users_select_own_or_public" on public.users
  for select
  using (auth.uid() = id or profile_public = true);

-- ─── Storage bucket for avatars ──────────────────────────────────────────────
-- Note: bucket is created via API on first upload; this documents the intent.
-- Run in Supabase dashboard or via supabase CLI:
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage RLS (applied after bucket creation)
-- Allow authenticated users to upload their own avatar
-- Allow public read of all avatars


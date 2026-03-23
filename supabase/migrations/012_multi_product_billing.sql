-- ─────────────────────────────────────────────────────────────────────────────
--  The Daily Libra — Multi-Product Billing
--  Migration: 012_multi_product_billing.sql
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.users
  add column if not exists pro_member_since timestamptz;

alter table public.subscriptions
  add column if not exists plan_key text,
  add column if not exists access_started_at timestamptz;

update public.subscriptions
set plan_key = case
  when plan_key is not null then plan_key
  when plan_name = 'high_priestess_annual' then 'high_priestess_annual'
  when plan_name = 'premium_annual' then 'premium_annual'
  when plan_name = 'premium_monthly' then 'premium_monthly'
  else null
end
where plan_key is null;

update public.subscriptions
set access_started_at = coalesce(current_period_start, created_at)
where access_started_at is null
  and status in ('active', 'trialing');

alter table public.subscriptions
  drop constraint if exists subscriptions_user_id_key;

create unique index if not exists subscriptions_stripe_subscription_id_unique
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

create index if not exists subscriptions_user_id_status_idx
  on public.subscriptions (user_id, status);

create index if not exists subscriptions_user_id_period_end_idx
  on public.subscriptions (user_id, current_period_end desc);

with derived as (
  select
    s.user_id,
    case
      when bool_or(
        s.status in ('active', 'trialing')
        and coalesce(s.plan_key, s.plan_name) = 'high_priestess_annual'
      ) then 'high_priestess'::subscription_tier
      when bool_or(
        s.status in ('active', 'trialing')
        and coalesce(s.plan_key, s.plan_name) in ('premium_monthly', 'premium_annual')
      ) then 'premium'::subscription_tier
      else 'free'::subscription_tier
    end as resolved_tier,
    min(coalesce(s.access_started_at, s.current_period_start, s.created_at))
      filter (where s.status in ('active', 'trialing')) as resolved_pro_member_since
  from public.subscriptions s
  group by s.user_id
)
update public.users u
set
  subscription_tier = derived.resolved_tier,
  pro_member_since = derived.resolved_pro_member_since,
  updated_at = now()
from derived
where u.id = derived.user_id;

update public.users u
set
  subscription_tier = 'free'::subscription_tier,
  pro_member_since = null,
  updated_at = now()
where not exists (
  select 1
  from public.subscriptions s
  where s.user_id = u.id
    and s.status in ('active', 'trialing')
);

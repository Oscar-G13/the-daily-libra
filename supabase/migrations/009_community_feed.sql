-- Community feed: users can share readings, reflections, and insights publicly
-- Posts are linked to the original content (optional) and have likes

create table if not exists feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  post_type text not null check (post_type in ('reading', 'reflection', 'compatibility', 'insight', 'quote')),
  content text not null,               -- the public text shown
  source_id uuid,                      -- optional link to source record
  mood text,                           -- optional mood tag
  like_count integer not null default 0,
  is_anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists feed_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  post_id uuid not null references feed_posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, post_id)
);

-- Indexes
create index if not exists feed_posts_created_at on feed_posts(created_at desc);
create index if not exists feed_posts_user_id on feed_posts(user_id);
create index if not exists feed_likes_post_id on feed_likes(post_id);

-- RLS
alter table feed_posts enable row level security;
alter table feed_likes enable row level security;

-- Anyone authenticated can read posts
create policy "Anyone can read feed posts"
  on feed_posts for select
  using (auth.uid() is not null);

-- Users manage their own posts
create policy "Users manage own posts"
  on feed_posts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Anyone authenticated can like/unlike
create policy "Users manage own likes"
  on feed_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Anyone can read likes"
  on feed_likes for select
  using (auth.uid() is not null);

-- Function to increment/decrement like count
create or replace function handle_like_insert()
returns trigger language plpgsql security definer as $$
begin
  update feed_posts set like_count = like_count + 1 where id = new.post_id;
  return new;
end;
$$;

create or replace function handle_like_delete()
returns trigger language plpgsql security definer as $$
begin
  update feed_posts set like_count = greatest(0, like_count - 1) where id = old.post_id;
  return old;
end;
$$;

drop trigger if exists on_like_insert on feed_likes;
create trigger on_like_insert
  after insert on feed_likes
  for each row execute function handle_like_insert();

drop trigger if exists on_like_delete on feed_likes;
create trigger on_like_delete
  after delete on feed_likes
  for each row execute function handle_like_delete();

-- ============================================================================
-- AxleLift Supabase schema + Row Level Security
-- Run this in the Supabase dashboard: SQL Editor -> New query -> Run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- profiles: one row per auth user, holding public-facing identity + ELO state.
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  username      text unique,
  lifetime_elo  integer not null default 1000,
  seasonal_elo  integer not null default 0,
  rank          text not null default 'Novice',
  avatar_url    text,
  components    jsonb not null default
                '{"strength":40,"progress":30,"consistency":50,"scienceScore":35}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles add column if not exists avatar_url text;

alter table public.profiles enable row level security;


drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Authenticated users may read public leaderboard fields from all profiles.
drop policy if exists "profiles_select_leaderboard" on public.profiles;
create policy "profiles_select_leaderboard"
  on public.profiles for select
  to authenticated
  using (true);

-- ----------------------------------------------------------------------------
-- workout_sessions: each logged session. Exercises/sets are stored as JSONB to
-- mirror the app's nested shape without extra join tables.
-- ----------------------------------------------------------------------------
create table if not exists public.workout_sessions (
  id               text primary key,
  user_id          uuid not null references auth.users (id) on delete cascade,
  name             text not null,
  performed_at     bigint not null,           -- unix epoch milliseconds
  duration_minutes integer not null default 0,
  notes            text,
  exercises        jsonb not null default '[]'::jsonb,
  created_at       timestamptz not null default now()
);

alter table public.workout_sessions enable row level security;

drop policy if exists "sessions_select_own" on public.workout_sessions;
create policy "sessions_select_own"
  on public.workout_sessions for select
  using ((select auth.uid()) = user_id);

drop policy if exists "sessions_insert_own" on public.workout_sessions;
create policy "sessions_insert_own"
  on public.workout_sessions for insert
  with check ((select auth.uid()) = user_id);

drop policy if exists "sessions_update_own" on public.workout_sessions;
create policy "sessions_update_own"
  on public.workout_sessions for update
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "sessions_delete_own" on public.workout_sessions;
create policy "sessions_delete_own"
  on public.workout_sessions for delete
  using ((select auth.uid()) = user_id);

create index if not exists workout_sessions_user_perf_idx
  on public.workout_sessions (user_id, performed_at desc);

-- ----------------------------------------------------------------------------
-- Auto-provision a profile row whenever a new auth user is created.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Prevent direct RPC calls; the trigger still fires with owner privileges.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh on profile writes.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- ----------------------------------------------------------------------------
-- Avatar storage bucket (run once; safe to re-run with IF NOT EXISTS patterns).
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

-- Public read for avatar images (leaderboards, profile display).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');

-- Authenticated users manage only their own folder: {userId}/avatar.jpg
drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

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
  components    jsonb not null default
                '{"strength":40,"progress":30,"consistency":50,"scienceScore":35}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A user may only read/write their OWN profile row.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

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
  using (auth.uid() = user_id);

drop policy if exists "sessions_insert_own" on public.workout_sessions;
create policy "sessions_insert_own"
  on public.workout_sessions for insert
  with check (auth.uid() = user_id);

drop policy if exists "sessions_update_own" on public.workout_sessions;
create policy "sessions_update_own"
  on public.workout_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "sessions_delete_own" on public.workout_sessions;
create policy "sessions_delete_own"
  on public.workout_sessions for delete
  using (auth.uid() = user_id);

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

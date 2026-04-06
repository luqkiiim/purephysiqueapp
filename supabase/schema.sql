create table if not exists coach_profiles (
  id text primary key,
  auth_user_id text unique,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists clients (
  id text primary key,
  coach_id text not null references coach_profiles(id) on delete cascade,
  full_name text not null,
  email text not null,
  invite_token text not null unique,
  active_status text not null default 'active' check (active_status in ('active', 'paused', 'inactive')),
  current_streak integer not null default 0,
  last_check_in_date date,
  last_accessed_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (coach_id, email)
);

create table if not exists client_profiles (
  id text primary key,
  client_id text not null unique references clients(id) on delete cascade,
  goal_summary text not null,
  training_phase text not null,
  timezone text not null default 'UTC',
  coaching_start_date date not null,
  welcome_message text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists client_targets (
  id text primary key,
  client_id text not null unique references clients(id) on delete cascade,
  protein_target_grams integer not null,
  step_target integer not null,
  exercise_expectation text not null,
  probiotics_enabled boolean not null default true,
  fish_oil_enabled boolean not null default true,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists reminder_settings (
  id text primary key,
  client_id text not null unique references clients(id) on delete cascade,
  email_reminders_enabled boolean not null default true,
  missed_day_nudges_enabled boolean not null default true,
  reminder_time time not null default '19:00:00',
  weekly_summary_enabled boolean not null default true,
  timezone text not null default 'UTC',
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists daily_check_ins (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  date date not null,
  bedtime time not null,
  wake_time time not null,
  total_sleep_hours numeric not null,
  protein_grams integer not null,
  protein_target_snapshot integer not null,
  steps integer not null,
  step_target_snapshot integer not null,
  hydration_liters numeric not null default 0,
  exercise_type text not null,
  exercise_duration_minutes integer not null,
  probiotics_checked boolean not null default false,
  fish_oil_checked boolean not null default false,
  body_weight numeric not null,
  meal_notes text,
  completion_percentage integer not null,
  submitted_at timestamptz not null,
  created_at timestamptz not null,
  updated_at timestamptz not null,
  unique (client_id, date)
);

create table if not exists progress_photos (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  daily_check_in_id text references daily_check_ins(id) on delete set null,
  date date not null,
  storage_path text not null unique,
  image_url text,
  note text,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists coach_notes (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  coach_id text not null references coach_profiles(id) on delete cascade,
  note text not null,
  visibility text not null check (visibility in ('private', 'shared')),
  created_at timestamptz not null
);

create table if not exists client_feedback_messages (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  coach_id text not null references coach_profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null,
  read_at timestamptz
);

create table if not exists client_access_tokens (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  token_hash text not null,
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null
);

create table if not exists notification_logs (
  id text primary key,
  client_id text not null references clients(id) on delete cascade,
  notification_type text not null,
  delivery_status text not null default 'queued',
  metadata jsonb not null default '{}'::jsonb,
  sent_at timestamptz not null,
  created_at timestamptz not null
);

create index if not exists clients_coach_id_idx on clients (coach_id);
create index if not exists clients_invite_token_idx on clients (invite_token);
create index if not exists daily_check_ins_client_date_idx on daily_check_ins (client_id, date desc);
create index if not exists progress_photos_client_date_idx on progress_photos (client_id, date desc);
create index if not exists coach_notes_client_created_idx on coach_notes (client_id, created_at desc);
create index if not exists feedback_messages_client_created_idx on client_feedback_messages (client_id, created_at desc);
create index if not exists notification_logs_client_sent_idx on notification_logs (client_id, sent_at desc);

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.current_coach_id()
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select coach.id
  from public.coach_profiles as coach
  where coach.auth_user_id = ((select auth.uid())::text)
  limit 1
$$;

create or replace function private.current_coach_client_ids()
returns text[]
language sql
security definer
stable
set search_path = ''
as $$
  select coalesce(array_agg(client.id), array[]::text[])
  from public.clients as client
  where client.coach_id = (select private.current_coach_id())
$$;

revoke all on function private.current_coach_id() from public;
grant execute on function private.current_coach_id() to authenticated;

revoke all on function private.current_coach_client_ids() from public;
grant execute on function private.current_coach_client_ids() to authenticated;

alter table public.coach_profiles enable row level security;
alter table public.clients enable row level security;
alter table public.client_profiles enable row level security;
alter table public.client_targets enable row level security;
alter table public.reminder_settings enable row level security;
alter table public.daily_check_ins enable row level security;
alter table public.progress_photos enable row level security;
alter table public.coach_notes enable row level security;
alter table public.client_feedback_messages enable row level security;
alter table public.client_access_tokens enable row level security;
alter table public.notification_logs enable row level security;

drop policy if exists coach_profiles_select_self on public.coach_profiles;
create policy coach_profiles_select_self
on public.coach_profiles
for select
to authenticated
using (
  (select auth.uid()) is not null
  and auth_user_id = ((select auth.uid())::text)
);

drop policy if exists coach_profiles_update_self on public.coach_profiles;
create policy coach_profiles_update_self
on public.coach_profiles
for update
to authenticated
using (
  (select auth.uid()) is not null
  and auth_user_id = ((select auth.uid())::text)
)
with check (
  auth_user_id = ((select auth.uid())::text)
);

drop policy if exists clients_manage_owned on public.clients;
create policy clients_manage_owned
on public.clients
for all
to authenticated
using (
  (select private.current_coach_id()) is not null
  and coach_id = (select private.current_coach_id())
)
with check (
  coach_id = (select private.current_coach_id())
);

drop policy if exists client_profiles_manage_owned on public.client_profiles;
create policy client_profiles_manage_owned
on public.client_profiles
for all
to authenticated
using (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
)
with check (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
);

drop policy if exists client_targets_manage_owned on public.client_targets;
create policy client_targets_manage_owned
on public.client_targets
for all
to authenticated
using (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
)
with check (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
);

drop policy if exists reminder_settings_manage_owned on public.reminder_settings;
create policy reminder_settings_manage_owned
on public.reminder_settings
for all
to authenticated
using (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
)
with check (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
);

drop policy if exists daily_check_ins_manage_owned on public.daily_check_ins;
create policy daily_check_ins_manage_owned
on public.daily_check_ins
for all
to authenticated
using (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
)
with check (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
);

drop policy if exists progress_photos_manage_owned on public.progress_photos;
create policy progress_photos_manage_owned
on public.progress_photos
for all
to authenticated
using (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
)
with check (
  client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
);

drop policy if exists coach_notes_manage_owned on public.coach_notes;
create policy coach_notes_manage_owned
on public.coach_notes
for all
to authenticated
using (
  coach_id = (select private.current_coach_id())
  and client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
)
with check (
  coach_id = (select private.current_coach_id())
  and client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
);

drop policy if exists client_feedback_messages_manage_owned on public.client_feedback_messages;
create policy client_feedback_messages_manage_owned
on public.client_feedback_messages
for all
to authenticated
using (
  coach_id = (select private.current_coach_id())
  and client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
)
with check (
  coach_id = (select private.current_coach_id())
  and client_id = any (coalesce((select private.current_coach_client_ids()), array[]::text[]))
);

drop policy if exists client_access_tokens_no_direct_access on public.client_access_tokens;
create policy client_access_tokens_no_direct_access
on public.client_access_tokens
for all
to authenticated
using (false)
with check (false);

drop policy if exists notification_logs_no_direct_access on public.notification_logs;
create policy notification_logs_no_direct_access
on public.notification_logs
for all
to authenticated
using (false)
with check (false);

-- Hotfix for deployments created before client Supabase Auth linking was added.
-- Run this once in the Supabase SQL editor for the affected project.

alter table public.clients
add column if not exists auth_user_id text;

create unique index if not exists clients_auth_user_id_idx
on public.clients (auth_user_id)
where auth_user_id is not null;

notify pgrst, 'reload schema';

-- Optional verification:
-- select column_name
-- from information_schema.columns
-- where table_schema = 'public'
--   and table_name = 'clients'
--   and column_name = 'auth_user_id';

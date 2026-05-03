# Schema Notes

## Main entities

- `coach_profiles`
- `clients`
- `client_profiles`
- `client_targets`
- `reminder_settings`
- `daily_check_ins`
- `progress_photos`
- `coach_notes`
- `client_feedback_messages`
- `client_access_tokens`
- `notification_logs`

## Relationship summary

- One `coach_profiles` row owns many `clients`.
- Each `clients` row has one `client_profiles`, one `client_targets`, and one `reminder_settings`.
- Each client has many `daily_check_ins`, `progress_photos`, `coach_notes`, `client_feedback_messages`, invite-token audit records, and notification records.
- Supabase `auth.users` is linked to `coach_profiles.auth_user_id` for coach sign-in and `clients.auth_user_id` for claimed client accounts.

## Security model

- Row Level Security is enabled on all public app tables in [schema.sql](../supabase/schema.sql).
- Authenticated coach users can only access rows tied to the `coach_profiles` row whose `auth_user_id` matches `auth.uid()`.
- Clients claim access with the current `invite_token`/access code, then use Supabase Auth email/password sessions.
- Client data access still runs through server-side authorization checks, and the server validates that the signed-in user matches `clients.auth_user_id`.
- Client writes on `daily_check_ins` and `progress_photos` are restricted in server actions to current-day logging in version one.
- Progress photos live in a private Supabase bucket and are exposed through server-generated signed URLs.
- Invite and notification audit tables are intended for server-side writes and stay blocked for direct authenticated access.

## Design notes

- `daily_check_ins` keeps most daily fields in one record so the main mobile flow stays simple.
- `protein_target_snapshot` and `step_target_snapshot` preserve context if targets change later.
- `current_streak` and `last_check_in_date` are stored on `clients` so the dashboard can stay fast.
- `notification_logs` is now only needed for lightweight internal audit events such as coach feedback.
- The Supabase SQL schema lives in [schema.sql](../supabase/schema.sql).
- Deployments created before client auth linking should run [hotfix-client-auth-user-id.sql](../supabase/hotfix-client-auth-user-id.sql) once to add `clients.auth_user_id` and reload the PostgREST schema cache.

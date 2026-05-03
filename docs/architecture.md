# Architecture Notes

## Product shape

The product is designed around one coach managing multiple clients. The coach side is structured and operational. The client side is intentionally lighter, warmer, and mobile-first.

## Main architectural decisions

- Next.js App Router is used for route grouping, server components, and server actions.
- Supabase Postgres stores all coaching domain data.
- Supabase Auth is used for coach and client accounts.
- Clients claim their account once with a coach-issued access code, email, and password.
- Supabase Storage holds private progress photos.
- The UI has a demo mode fallback so pages can render before environment variables are configured.
- Server actions own create/update flows for clients, notes, feedback, invite access, and daily check-ins.
- Authorization is enforced in server-side app logic in version one.

## Coach flow

1. Coach signs in with Supabase Auth.
2. Coach creates a client profile and targets.
3. App stores the client record, targets, access settings, and invite token in Supabase Postgres.
4. Coach shares the generated access code manually when first sign-in is needed.
5. Coach monitors dashboard status, trends, notes, and visible feedback.

## Client flow

1. Client opens `/access`.
2. Client enters the coach-issued access code, email, and password.
3. Client lands on a single daily check-in view.
4. Later sessions use Supabase Auth email/password sign-in.
5. Client logs today's data and optionally uploads a progress photo.

## UI system

- `components/ui/*` contains reusable primitives.
- `components/layout/*` contains coach and client shells plus navigation.
- `components/forms/*` holds the product's main forms.
- `components/charts/*` contains reusable chart cards.

## Extension points

- wearable or phone step sync can attach to `daily_check_ins.steps`
- push/SMS/WhatsApp reminders can reuse `notification_logs`
- more supplements can expand `client_targets` and `daily_check_ins`
- before/after tooling can build on `progress_photos`

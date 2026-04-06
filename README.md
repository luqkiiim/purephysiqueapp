# Pure Physique App

Pure Physique is a mobile-first coaching app that replaces a client tracking spreadsheet with a fast daily check-in experience for clients and a structured oversight dashboard for one coach managing multiple clients.

## Product summary

- Clients complete a daily check-in in under 60 seconds.
- One coach account manages multiple client profiles and targets.
- Clients access the app through a private invite link.
- The coach can track adherence, streaks, missed check-ins, body weight, protein, steps, exercise, supplements, notes, and visible feedback.
- Version one includes progress photos, weekly summaries, reminder emails, and server-side access control around Supabase data.

## Architecture

- Frontend: Next.js App Router, TypeScript, Tailwind CSS.
- Backend: Supabase Postgres for coaching data, Supabase Auth for coach login, and Supabase Storage for private progress photos.
- Email: Resend service wrapper for optional invite emails, reminders, nudges, and weekly summaries.
- Charts: Recharts for mobile-friendly trend and target visualisation.
- Mutations: Next.js Server Actions for coach and client flows.

Detailed design notes live in:

- [Architecture notes](./docs/architecture.md)
- [Schema notes](./docs/schema.md)

## Core routes

- Public
  - `/`
  - `/access/[token]`
  - `/access/[token]/verify`
- Coach
  - `/coach/login`
  - `/coach`
  - `/coach/clients`
  - `/coach/clients/new`
  - `/coach/clients/[clientId]`
  - `/coach/clients/[clientId]/edit`
  - `/coach/settings`
- Client
  - `/client`
  - `/client/history`
  - `/client/weekly`
  - `/client/photos`
  - `/client/messages`

## Folder structure

```text
app/
  (marketing)/
  access/[token]/
  (coach)/coach/
  (client)/client/
  api/cron/reminders/
  actions/
components/
  charts/
  forms/
  layout/
  ui/
lib/
  database/
  data/
  demo/
  email/
  supabase/
  types/
  validation/
supabase/
  schema.sql
  seed.sql
docs/
```

## Supabase setup

1. Copy [.env.example](./.env.example) to `.env.local`.
2. Create a Supabase project.
3. Run [supabase/schema.sql](./supabase/schema.sql) in the Supabase SQL editor.
4. Optionally run [supabase/seed.sql](./supabase/seed.sql) for demo records.
5. Create the coach auth user in Supabase Authentication.
6. Configure a private storage bucket named `progress-photos`.
7. Fill in the Supabase environment variables from [.env.example](./.env.example).
8. `npm run db:init` prints the same setup checklist for convenience.

## Supabase auth and storage setup

1. Create a Supabase project.
2. In Authentication:
   - enable email sign-in
   - set your site URL to the deployed app URL
3. Create coach auth users as needed.
4. Configure a private storage bucket named `progress-photos` and keep `SUPABASE_SERVICE_ROLE_KEY` available server-side for uploads and signed URLs.
5. Add the remaining environment variables from [.env.example](./.env.example).

## Email and reminder logic

- Invite emails are sent after client creation if `sendInvite` is checked.
- Daily reminders, missed-day nudges, and weekly summaries are sent through `app/api/cron/reminders/route.ts`.
- Resend is optional if you only want manual link sharing during previews.
- Schedule the cron route every 15 minutes and send `Authorization: Bearer $CRON_SECRET`.

## Progress photo storage

- Photos upload into the `progress-photos` Supabase bucket under `client_id/date/file.ext`.
- Signed URLs are generated server-side before rendering image cards.
- The app uses server-side authorization checks before generating signed URLs, rather than database-level storage policies tied to coaching tables.

## Seed data

The seed file creates:

- one coach profile
- three demo clients
- client targets and reminder settings
- recent check-ins
- coach notes and feedback messages

## Local setup

1. Install Node.js 20+.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env.local`.
4. Apply the Supabase schema and optional seed:
   ```bash
   npm run db:init
   ```
5. Configure Supabase Auth and a private `progress-photos` bucket.
6. Start the app:
   ```bash
   npm run dev
   ```
7. Open `http://localhost:3000`.

## Notes for this workspace

- Node.js is available on `PATH` in this workspace.
- The app includes demo-mode fallbacks so the UI structure is clear even before Supabase is configured.

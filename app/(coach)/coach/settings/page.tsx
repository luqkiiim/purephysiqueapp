import { CoachShell } from "@/components/layout/coach-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default function CoachSettingsPage() {
  return (
    <CoachShell
      heading="Settings and reminders"
      subheading="Operational guidance for email reminders, storage, and access control in version one."
      demoMode={!isLiveAppEnabled}
    >
      <section className="grid gap-4 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Email flows</CardTitle>
            <CardDescription>
              Invite email, daily reminder, missed-day nudge, and weekly summary all run through the email service layer.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            Configure `RESEND_API_KEY`, `EMAIL_FROM`, and `CRON_SECRET` before enabling production reminders.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Client access security</CardTitle>
            <CardDescription>
              Private invite links, backed by server-side authorization checks.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            Clients only read and write their own current-day records. Coaches only access their own roster through Supabase-backed queries scoped in server actions.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
            <CardDescription>
              Progress photos live in a private bucket and are stored under client-specific paths.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">
            Signed URLs should be used at render time so photos remain private outside the app session.
          </CardContent>
        </Card>
      </section>
    </CoachShell>
  );
}

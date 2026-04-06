import { CoachShell } from "@/components/layout/coach-shell";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Client access security</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Storage</CardTitle>
          </CardHeader>
        </Card>
      </section>
    </CoachShell>
  );
}

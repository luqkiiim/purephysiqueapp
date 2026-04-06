import { saveClientAction } from "@/app/actions/coach";
import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { CoachShell } from "@/components/layout/coach-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default function NewClientPage() {
  return (
    <CoachShell
      heading="Create client"
      subheading="Set the client up once, define targets, then send the private access link."
      demoMode={!isLiveAppEnabled}
    >
      <Card>
        <CardHeader>
          <CardTitle>Client profile and targets</CardTitle>
          <CardDescription>
            Version one keeps setup lightweight: identity, goal context, daily targets, supplements, and reminder settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientProfileForm action={saveClientAction} />
        </CardContent>
      </Card>
    </CoachShell>
  );
}

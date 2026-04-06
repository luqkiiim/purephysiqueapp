import { saveClientAction } from "@/app/actions/coach";
import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { CoachShell } from "@/components/layout/coach-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoachClientDetailData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const data = await getCoachClientDetailData(clientId);

  return (
    <CoachShell
      heading={`Edit ${data.client.fullName}`}
      subheading="Adjust targets, reminders, and client-facing context without changing the underlying workflow."
      demoMode={!isLiveAppEnabled}
    >
      <Card>
        <CardHeader>
          <CardTitle>Profile settings</CardTitle>
          <CardDescription>
            Update the client’s targets, reminders, supplements, and onboarding copy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ClientProfileForm action={saveClientAction} client={data.client} />
        </CardContent>
      </Card>
    </CoachShell>
  );
}

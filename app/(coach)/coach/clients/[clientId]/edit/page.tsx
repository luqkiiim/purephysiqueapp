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
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Profile settings</CardTitle>
            <CardDescription>
              Update the client&apos;s targets, reminders, supplements, and onboarding copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientProfileForm action={saveClientAction} client={data.client} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Before saving</CardTitle>
            <CardDescription>
              A few small checks keep the client experience clean after edits go live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-slate-900">Review the welcome message</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This appears in the mobile client home, so it reads best as a short coaching cue
                rather than a long block of text.
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-slate-900">Check reminder timing</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Reminder time and nudges should match the client&apos;s actual timezone and routine.
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-slate-900">Resend access only when needed</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Leave the invite toggle off unless the client needs a fresh link after your changes.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </CoachShell>
  );
}

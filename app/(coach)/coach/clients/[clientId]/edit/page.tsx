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
      subheading="Adjust targets and client-facing context without changing the underlying workflow."
      demoMode={!isLiveAppEnabled}
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Profile settings</CardTitle>
            <CardDescription>
              Update the client&apos;s targets, supplements, and onboarding copy.
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
              <p className="text-sm font-semibold text-slate-900">Keep the access flow simple</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Client access is manual now, so the main operational step is just sharing the
                current access code when first sign-in is needed.
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-slate-900">Review training phase and welcome copy</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Those two details shape the client-facing experience more than anything else in
                this screen.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </CoachShell>
  );
}

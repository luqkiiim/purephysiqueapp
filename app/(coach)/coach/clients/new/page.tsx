import { saveClientAction } from "@/app/actions/coach";
import { ClientProfileForm } from "@/components/forms/client-profile-form";
import { CoachShell } from "@/components/layout/coach-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default function NewClientPage() {
  return (
    <CoachShell
      heading="Create client"
      subheading="Set the client up once, define targets, then share the private access link manually."
      demoMode={!isLiveAppEnabled}
    >
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Client profile and targets</CardTitle>
            <CardDescription>
              Version one keeps setup lightweight: identity, goal context, daily targets, and
              supplements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ClientProfileForm action={saveClientAction} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Setup checklist</CardTitle>
            <CardDescription>
              The mobile-friendly flow works best when these details are set clearly from the
              start.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-slate-900">Use a short goal summary</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Keep the current phase and focus concise so it reads cleanly in the coach and
                client headers.
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-slate-900">Set realistic daily anchors</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Protein, steps, and workout expectation should be simple enough to log quickly from
                a phone.
              </p>
            </div>
            <div className="surface-muted p-4">
              <p className="text-sm font-semibold text-slate-900">Only enable useful extras</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Optional supplement tracking should stay intentional, otherwise the check-in starts
                feeling crowded.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </CoachShell>
  );
}

import {
  saveCoachClientDefaultsAction,
  saveCoachDashboardPreferencesAction,
  saveCoachProfileSettingsAction,
} from "@/app/actions/coach";
import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { CoachShell } from "@/components/layout/coach-shell";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCoachSettingsPageData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";

function getSavedMessage(saved?: string) {
  switch (saved) {
    case "profile":
      return "Coach profile updated.";
    case "defaults":
      return "New client defaults updated.";
    case "dashboard":
      return "Dashboard preferences updated.";
    default:
      return null;
  }
}

export default async function CoachSettingsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const savedValue = resolvedSearchParams.saved;
  const saved = Array.isArray(savedValue) ? savedValue[0] : savedValue;
  const savedMessage = getSavedMessage(saved);
  const data = await getCoachSettingsPageData();

  return (
    <CoachShell
      heading="Settings"
      subheading="Real controls for coach profile, new-client defaults, and dashboard behavior."
      demoMode={!isLiveAppEnabled}
    >
      {savedMessage ? (
        <div className="rounded-[1.6rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {savedMessage}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total clients</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {data.accessSummary.totalClients}
          </p>
        </div>
        <div className="surface-card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Claimed accounts</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {data.accessSummary.claimedClients}
          </p>
        </div>
        <div className="surface-card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Pending first sign-in</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {data.accessSummary.pendingClaims}
          </p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Coach profile</CardTitle>
            <CardDescription>
              Keep the coach identity clean and current. Login email stays informational here.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={saveCoachProfileSettingsAction} className="space-y-4">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-900">Coach name</span>
                <Input
                  name="fullName"
                  defaultValue={data.coach.fullName}
                  placeholder="Imran Ismadi"
                  required
                />
              </label>
              <div className="surface-muted p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Login email</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{data.coach.email}</p>
              </div>
              <FormSubmitButton variant="teal" fullWidth pendingLabel="Saving profile...">
                Save coach profile
              </FormSubmitButton>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dashboard preferences</CardTitle>
            <CardDescription>
              These controls change how the overview and roster are ordered on this device.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={saveCoachDashboardPreferencesAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Roster sort</span>
                  <Select
                    name="rosterSort"
                    defaultValue={data.dashboardPreferences.rosterSort}
                  >
                    <option value="name">Name</option>
                    <option value="streak">Streak</option>
                    <option value="adherence">Adherence</option>
                  </Select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Chart window</span>
                  <Select
                    name="chartWindowDays"
                    defaultValue={String(data.dashboardPreferences.chartWindowDays)}
                  >
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                    <option value="42">42 days</option>
                  </Select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Follow-up list</span>
                  <Select
                    name="followUpCount"
                    defaultValue={String(data.dashboardPreferences.followUpCount)}
                  >
                    <option value="4">4 clients</option>
                    <option value="6">6 clients</option>
                    <option value="8">8 clients</option>
                  </Select>
                </label>
              </div>

              <Checkbox
                name="highlightMissedClients"
                defaultChecked={data.dashboardPreferences.highlightMissedClients}
                label="Move missed clients to the top"
                description="Applies to the overview and client roster so follow-up stays visible."
              />

              <FormSubmitButton variant="teal" fullWidth pendingLabel="Saving preferences...">
                Save dashboard preferences
              </FormSubmitButton>
            </form>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>New client defaults</CardTitle>
            <CardDescription>
              These values prefill the create-client form on this device so repeated setup takes
              less manual work.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form action={saveCoachClientDefaultsAction} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Training phase</span>
                  <Input
                    name="trainingPhase"
                    defaultValue={data.clientDefaults.trainingPhase}
                    placeholder="Lean phase"
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Protein target</span>
                  <Input
                    name="proteinTargetGrams"
                    type="number"
                    defaultValue={data.clientDefaults.proteinTargetGrams}
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Step target</span>
                  <Input
                    name="stepTarget"
                    type="number"
                    defaultValue={data.clientDefaults.stepTarget}
                    required
                  />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-slate-900">Workout expectation</span>
                  <Input
                    name="exerciseExpectation"
                    defaultValue={data.clientDefaults.exerciseExpectation}
                    placeholder="4 training sessions / week"
                    required
                  />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-slate-900">Default welcome message</span>
                <Textarea
                  name="welcomeMessage"
                  defaultValue={data.clientDefaults.welcomeMessage}
                  placeholder="Optional"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <Checkbox
                  name="probioticsEnabled"
                  defaultChecked={data.clientDefaults.probioticsEnabled}
                  label="Enable probiotic tracking by default"
                  description="New clients start with probiotics visible in the check-in form."
                />
                <Checkbox
                  name="fishOilEnabled"
                  defaultChecked={data.clientDefaults.fishOilEnabled}
                  label="Enable fish oil tracking by default"
                  description="New clients start with fish oil visible in the check-in form."
                />
              </div>

              <FormSubmitButton variant="teal" fullWidth pendingLabel="Saving defaults...">
                Save new client defaults
              </FormSubmitButton>
            </form>
          </CardContent>
        </Card>
      </section>
    </CoachShell>
  );
}

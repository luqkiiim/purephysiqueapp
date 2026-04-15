import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { SectionHeading } from "@/components/layout/section-heading";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Client } from "@/lib/types/app";

export function ClientProfileForm({
  action,
  client,
}: {
  action: (formData: FormData) => Promise<void>;
  client?: Client;
}) {
  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="clientId" value={client?.id ?? ""} />

      <div className="surface-muted p-4 sm:p-5">
        <SectionHeading
          eyebrow="Profile"
          title="Identity and coaching context"
          description="Set the basics first so the client sees the right name, timezone, phase, and onboarding copy on mobile."
          className="mb-4"
        />
        <div className="grid gap-4">
          <section className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-900">Client name</span>
              <Input
                name="fullName"
                placeholder="Ava Morgan"
                defaultValue={client?.fullName}
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-900">Training phase</span>
              <Input
                name="trainingPhase"
                placeholder="Lean phase"
                defaultValue={client?.profile.trainingPhase}
                required
              />
            </label>
          </section>

          <section className="grid gap-4 sm:grid-cols-1">
            <label className="block space-y-2">
              <span className="text-sm font-semibold text-slate-900">Timezone</span>
              <Input
                name="timezone"
                placeholder="Asia/Kuala_Lumpur"
                defaultValue={client?.profile.timezone ?? "Asia/Kuala_Lumpur"}
                required
              />
            </label>
          </section>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Goal summary</span>
            <Textarea
              name="goalSummary"
              placeholder="What is the current focus for this client?"
              defaultValue={client?.profile.goalSummary}
              required
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Welcome message</span>
            <Textarea
              name="welcomeMessage"
              placeholder="The client sees this message on their check-in home."
              defaultValue={client?.profile.welcomeMessage}
              required
            />
          </label>
        </div>
      </div>

      <div className="surface-muted p-4 sm:p-5">
        <SectionHeading
          eyebrow="Targets"
          title="Daily anchors"
          description="These are the numbers and expectations that show up in the client check-in flow."
          className="mb-4"
        />
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Protein target</span>
            <Input
              name="proteinTargetGrams"
              type="number"
              placeholder="150"
              defaultValue={client?.targets.proteinTargetGrams}
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Step target</span>
            <Input
              name="stepTarget"
              type="number"
              placeholder="9000"
              defaultValue={client?.targets.stepTarget}
              required
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-slate-900">Workout expectation</span>
            <Input
              name="exerciseExpectation"
              placeholder="4 training sessions / week"
              defaultValue={client?.targets.exerciseExpectation}
              required
            />
          </label>
        </section>
      </div>

      <div className="surface-muted p-4 sm:p-5">
        <SectionHeading
          eyebrow="Supplements"
          title="Optional tracking"
          description="Enable only the extras you want visible so the check-in stays light on small screens."
          className="mb-4"
        />
        <section className="grid gap-4 sm:grid-cols-2">
          <Checkbox
            name="probioticsEnabled"
            defaultChecked={client?.targets.probioticsEnabled ?? true}
            label="Track probiotics"
            description="Show probiotic supplement tracking in the client check-in."
          />
          <Checkbox
            name="fishOilEnabled"
            defaultChecked={client?.targets.fishOilEnabled ?? true}
            label="Track fish oil"
            description="Show fish oil tracking in the client check-in."
          />
        </section>
      </div>

      <FormSubmitButton variant="teal" size="lg" fullWidth pendingLabel="Saving client...">
        {client ? "Update client" : "Create client"}
      </FormSubmitButton>
    </form>
  );
}

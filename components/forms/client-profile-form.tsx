import type { Client } from "@/lib/types/app";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSubmitButton } from "@/components/forms/form-submit-button";

export function ClientProfileForm({
  action,
  client,
}: {
  action: (formData: FormData) => Promise<void>;
  client?: Client;
}) {
  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="clientId" value={client?.id ?? ""} />
      <section className="grid gap-4 md:grid-cols-2">
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
          <span className="text-sm font-semibold text-slate-900">Email</span>
          <Input
            name="email"
            type="email"
            placeholder="ava@example.com"
            defaultValue={client?.email}
            required
          />
        </label>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-900">Training phase</span>
          <Input
            name="trainingPhase"
            placeholder="Lean phase"
            defaultValue={client?.profile.trainingPhase}
            required
          />
        </label>
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

      <section className="grid gap-4 md:grid-cols-3">
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

      <section className="grid gap-4 md:grid-cols-2">
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

      <section className="grid gap-4 md:grid-cols-3">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-900">Reminder time</span>
          <Input
            name="reminderTime"
            type="time"
            defaultValue={client?.reminderSettings.reminderTime.slice(0, 5) ?? "19:00"}
            required
          />
        </label>
        <Checkbox
          name="emailRemindersEnabled"
          defaultChecked={client?.reminderSettings.emailRemindersEnabled ?? true}
          label="Daily reminder emails"
          description="Send a daily check-in reminder."
        />
        <Checkbox
          name="weeklySummaryEnabled"
          defaultChecked={client?.reminderSettings.weeklySummaryEnabled ?? true}
          label="Weekly summary email"
          description="Send a weekly consistency summary."
        />
      </section>

      <Checkbox
        name="missedDayNudgesEnabled"
        defaultChecked={client?.reminderSettings.missedDayNudgesEnabled ?? true}
        label="Missed-day nudges"
        description="Prompt the client when they miss a check-in."
      />

      <Checkbox
        name="sendInvite"
        defaultChecked={!client}
        label="Send invite email after saving"
        description="Includes the private access link for the client."
      />

      <FormSubmitButton variant="teal" size="lg" pendingLabel="Saving client...">
        {client ? "Update client" : "Create client"}
      </FormSubmitButton>
    </form>
  );
}

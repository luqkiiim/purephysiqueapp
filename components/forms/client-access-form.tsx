import { FormSubmitButton } from "@/components/forms/form-submit-button";

export function ClientAccessForm({
  action,
  inviteToken,
}: {
  action: (formData: FormData) => Promise<void>;
  inviteToken: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="inviteToken" value={inviteToken} />
      <FormSubmitButton variant="teal" size="lg" fullWidth pendingLabel="Opening...">
        Open check-in app
      </FormSubmitButton>
      <p className="text-center text-sm text-slate-600">
        No password or email code required on this device.
      </p>
    </form>
  );
}

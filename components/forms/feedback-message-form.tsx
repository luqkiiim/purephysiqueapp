import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { Textarea } from "@/components/ui/textarea";

export function FeedbackMessageForm({
  action,
  clientId,
}: {
  action: (formData: FormData) => Promise<void>;
  clientId: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="clientId" value={clientId} />
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Visible client message</span>
        <Textarea
          name="message"
          placeholder="Short, motivating feedback the client can see in their app."
          required
        />
      </label>
      <FormSubmitButton variant="coral" pendingLabel="Sending message...">
        Save client feedback
      </FormSubmitButton>
    </form>
  );
}

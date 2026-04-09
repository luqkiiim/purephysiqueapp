import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function CoachNoteForm({
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
        <span className="text-sm font-semibold text-slate-900">Visibility</span>
        <Select name="visibility" defaultValue="private" required>
          <option value="private">Private</option>
          <option value="shared">Shared with client</option>
        </Select>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Coach note</span>
        <Textarea
          name="note"
          placeholder="Capture context, patterns, and decisions for this client."
          required
        />
      </label>
      <FormSubmitButton variant="secondary" fullWidth pendingLabel="Saving note...">
        Save note
      </FormSubmitButton>
    </form>
  );
}

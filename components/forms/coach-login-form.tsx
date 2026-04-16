import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { Input } from "@/components/ui/input";

export function CoachLoginForm({
  action,
  defaultEmail,
  defaultPassword,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultEmail?: string;
  defaultPassword?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Email</span>
        <Input
          name="email"
          type="email"
          placeholder="you@example.com"
          defaultValue={defaultEmail}
          autoComplete="email"
          required
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Password</span>
        <Input
          name="password"
          type="password"
          placeholder="********"
          defaultValue={defaultPassword}
          autoComplete="current-password"
          required
        />
      </label>
      <FormSubmitButton variant="teal" size="lg" fullWidth pendingLabel="Signing in...">
        Log in
      </FormSubmitButton>
    </form>
  );
}

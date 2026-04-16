import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { Input } from "@/components/ui/input";

export function ClientAccessClaimForm({
  action,
  defaultAccessCode,
}: {
  action: (formData: FormData) => Promise<void>;
  defaultAccessCode?: string;
}) {
  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Access code</span>
        <Input
          name="accessCode"
          placeholder="ABCD-EFGH"
          defaultValue={defaultAccessCode}
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          required
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Email</span>
        <Input
          name="email"
          type="email"
          placeholder="client@example.com"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Password</span>
        <Input
          name="password"
          type="password"
          placeholder="At least 8 characters"
          required
        />
      </label>
      <FormSubmitButton variant="teal" size="lg" fullWidth pendingLabel="Creating account...">
        Sign up
      </FormSubmitButton>
    </form>
  );
}

export function ClientAccessLoginForm({
  action,
}: {
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={action} className="space-y-4">
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Email</span>
        <Input
          name="email"
          type="email"
          placeholder="client@example.com"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          required
        />
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-semibold text-slate-900">Password</span>
        <Input
          name="password"
          type="password"
          placeholder="Your password"
          required
        />
      </label>
      <FormSubmitButton variant="secondary" size="lg" fullWidth pendingLabel="Signing in...">
        Sign in to client app
      </FormSubmitButton>
    </form>
  );
}

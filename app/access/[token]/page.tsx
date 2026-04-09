import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import { openClientAccessAction } from "@/app/actions/access";
import { ClientAccessForm } from "@/components/forms/client-access-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientInviteData } from "@/lib/data/access";

export default async function ClientInvitePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { token } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorValue = resolvedSearchParams.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;
  const invite = await getClientInviteData(token);

  if (!invite) {
    return (
      <main className="page-shell">
        <Card className="mx-auto max-w-xl">
          <CardHeader>
            <CardTitle>Invite not found</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              This link is missing or expired. Head back to the home page and request a fresh
              invite if needed.
            </p>
          </CardHeader>
          <CardContent>
            <Link href="/" className="block w-full sm:inline-block sm:w-auto">
              <Button variant="secondary" fullWidth>
                Back to home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-xl space-y-5">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <Card className="overflow-hidden">
          <CardHeader>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl border border-accent-teal/25 bg-accent-teal/10">
              <LockKeyhole className="h-6 w-6 text-accent-teal" />
            </div>
            <CardTitle>Open your private check-in app</CardTitle>
            <p className="text-sm leading-6 text-slate-600">
              Built to open fast on mobile so the check-in flow feels direct and lightweight.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            {error ? (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {error === "invalid-invite"
                  ? "This private access link is invalid or no longer active."
                  : decodeURIComponent(error)}
              </div>
            ) : null}
            <div className="surface-muted p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Client</p>
              <p className="text-sm font-semibold text-slate-900">{invite.client.fullName}</p>
            </div>
            <ClientAccessForm action={openClientAccessAction} inviteToken={token} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

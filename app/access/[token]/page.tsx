import Link from "next/link";
import { ArrowLeft, Link2, LockKeyhole } from "lucide-react";

import { openClientAccessAction } from "@/app/actions/access";
import { ClientAccessForm } from "@/components/forms/client-access-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            <CardDescription>
              This private access link is invalid or expired. Ask your coach to send a fresh link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button variant="secondary">Back to home</Button>
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
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-accent-mint">
              <LockKeyhole className="h-6 w-6 text-slate-900" />
            </div>
            <CardTitle>Open your private check-in app</CardTitle>
            <CardDescription>
              This link is reserved for {invite.client.fullName}. Open it once on this device and the client area stays available until you switch links.
            </CardDescription>
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
              <p className="text-sm font-semibold text-slate-900">{invite.client.fullName}</p>
              <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                <Link2 className="h-4 w-4" />
                <span>Private invite link verified</span>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Reminder emails still go to {invite.client.email}. If the link ever stops working, ask your coach for a fresh one.
              </p>
            </div>
            <ClientAccessForm action={openClientAccessAction} inviteToken={token} />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

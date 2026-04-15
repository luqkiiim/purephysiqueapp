import Link from "next/link";
import { ArrowLeft, KeyRound, LockKeyhole } from "lucide-react";

import {
  claimClientAccessAction,
  loginClientAccessAction,
} from "@/app/actions/access";
import {
  ClientAccessClaimForm,
  ClientAccessLoginForm,
} from "@/components/forms/client-auth-forms";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoClientCredentials } from "@/lib/demo/credentials";
import { isLiveAppEnabled } from "@/lib/supabase/config";

function getAccessErrorMessage(error: string) {
  switch (error) {
    case "invalid-access-code":
      return "That access code is invalid or no longer active.";
    case "used-access-code":
      return "That access code has already been used. Ask your coach for a fresh one.";
    case "expired-access-code":
      return "That access code has expired. Ask your coach for a new one.";
    case "email-already-in-use":
      return "That email is already linked to a different account.";
    case "invalid-claim-input":
      return "Enter a valid access code, email, and password to claim the client account.";
    case "invalid-client-login":
      return "Email or password is incorrect.";
    case "inactive-client-account":
      return "This client account is inactive.";
    case "client-session-required":
      return "Sign in as a client to open the check-in app.";
    case "invalid-client-session":
      return "That client session is no longer valid. Sign in again.";
    default:
      return decodeURIComponent(error);
  }
}

export default async function ClientAccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const errorValue = resolvedSearchParams.error;
  const modeValue = resolvedSearchParams.mode;
  const codeValue = resolvedSearchParams.code;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;
  const mode = Array.isArray(modeValue) ? modeValue[0] : modeValue;
  const code = Array.isArray(codeValue) ? codeValue[0] : codeValue;
  const claimError = error && mode !== "login" ? getAccessErrorMessage(error) : null;
  const loginError = error && mode === "login" ? getAccessErrorMessage(error) : null;

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-5xl space-y-5">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <section className="surface-card overflow-hidden px-4 py-6 sm:px-8 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="space-y-5">
              <p className="eyebrow">Client access</p>
              <h1 className="font-display text-[2.1rem] leading-[0.96] text-slate-900 sm:text-5xl">
                Claim your client account once, then sign in normally after that.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
                Your coach gives you an access code for first setup. After the account is claimed,
                the client app uses your email and password only.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="tap-card">
                  <KeyRound className="h-5 w-5 text-accent-teal" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">First access</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Enter your coach-issued code, email, and password.
                  </p>
                </div>
                <div className="tap-card">
                  <LockKeyhole className="h-5 w-5 text-accent-coral" />
                  <p className="mt-3 text-sm font-semibold text-slate-900">Later logins</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Use your email and password only after the first claim.
                  </p>
                </div>
              </div>
            </div>

            {!isLiveAppEnabled ? (
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Demo client access</CardTitle>
                  <CardDescription>
                    Live auth is off locally, so the demo client app opens directly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="surface-muted p-4 text-sm">
                    <p className="font-semibold text-slate-900">{demoClientCredentials.fullName}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      Access code
                    </p>
                    <p className="mt-1 font-mono text-sm text-slate-900">
                      {demoClientCredentials.inviteToken}
                    </p>
                  </div>
                  <Link href="/client" className="block w-full">
                    <Button variant="teal" size="lg" fullWidth>
                      Open demo client app
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Claim account</CardTitle>
                    <CardDescription>
                      Use this the first time you open the client app.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {claimError ? (
                      <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {claimError}
                      </div>
                    ) : null}
                    <ClientAccessClaimForm
                      action={claimClientAccessAction}
                      defaultAccessCode={code}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>
                      Use this after your client account has already been claimed.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {loginError ? (
                      <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {loginError}
                      </div>
                    ) : null}
                    <ClientAccessLoginForm action={loginClientAccessAction} />
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

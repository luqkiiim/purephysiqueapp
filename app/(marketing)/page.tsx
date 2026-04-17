import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import {
  loginAppAction,
  quickLoginClientAction,
  quickLoginCoachAction,
} from "@/app/actions/auth";
import { CoachLoginForm } from "@/components/forms/coach-login-form";
import { FormSubmitButton } from "@/components/forms/form-submit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedAppPath } from "@/lib/auth";
import { demoClientCredentials, demoCoachCredentials } from "@/lib/demo/credentials";
import { isLiveAppEnabled, isTestQuickLoginEnabled } from "@/lib/supabase/config";

function getLoginErrorMessage(error: string) {
  switch (error) {
    case "invalid-login":
      return "Email or password is incorrect.";
    case "inactive-client-account":
      return "This account is inactive.";
    case "client-session-required":
      return "Log in to continue.";
    case "invalid-client-session":
      return "That session is no longer valid. Log in again.";
    case "missing-profile":
      return "This account is authenticated but is not linked to a coach profile yet.";
    case "no-app-access":
      return "This account does not have access to the app.";
    case "demo-login-only":
      return "Use the demo coach credentials shown below while live auth is off.";
    case "quick-login-disabled":
      return "Quick log in is not enabled on this deployment.";
    case "quick-login-unavailable":
      return "The testing account could not be signed in. Check the staging credentials.";
    default:
      return decodeURIComponent(error);
  }
}

export default async function AuthEntryPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authenticatedAppPath = await getAuthenticatedAppPath();

  if (authenticatedAppPath) {
    redirect(authenticatedAppPath);
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const errorValue = resolvedSearchParams.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;
  const loginError = error ? getLoginErrorMessage(error) : null;
  const isDemoMode = !isLiveAppEnabled;

  return (
    <main className="page-shell flex min-h-screen items-center justify-center py-10 sm:py-12">
      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-center sm:gap-6">
        <div className="space-y-4">
          <div className="mx-auto w-fit rounded-[2rem] border border-white/10 bg-white/96 p-3 shadow-[0_22px_44px_rgba(0,0,0,0.26)] sm:p-4">
            <Image
              src="/brand/logo.jpeg"
              alt="Pure Physique"
              width={128}
              height={128}
              className="h-24 w-24 rounded-[1.35rem] object-cover sm:h-28 sm:w-28"
              priority
            />
          </div>
          <div className="space-y-3">
            <p className="eyebrow text-center text-slate-200/70">Pure Physique</p>
            <h1 className="font-display text-[1.95rem] leading-[0.94] text-white sm:text-[2.6rem]">
              <span className="block">Small check-ins.</span>
              <span className="block">Real momentum.</span>
            </h1>
            <p className="mx-auto max-w-sm text-sm leading-6 text-slate-300 sm:text-base">
              Log in to pick up where you left off.
            </p>
          </div>
        </div>

        <div className="w-full space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Log in</CardTitle>
              <CardDescription>
                Use your email and password to enter the app.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loginError ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {loginError}
                </div>
              ) : null}
              <CoachLoginForm
                action={loginAppAction}
                defaultEmail={isDemoMode ? demoCoachCredentials.email : undefined}
                defaultPassword={isDemoMode ? demoCoachCredentials.password : undefined}
              />
              <div className="pt-1">
                <Link href="/access" className="block w-full">
                  <Button variant="secondary" size="lg" fullWidth>
                    Sign up
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {isTestQuickLoginEnabled ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>Quick log in</CardTitle>
                  <Badge tone="accent">Testing mode</Badge>
                </div>
                <CardDescription>
                  Direct access to the staging coach and client accounts for review.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <form action={quickLoginCoachAction}>
                  <FormSubmitButton variant="teal" size="lg" fullWidth pendingLabel="Signing in...">
                    Quick log in as coach
                  </FormSubmitButton>
                </form>
                <form action={quickLoginClientAction}>
                  <FormSubmitButton variant="ghost" size="lg" fullWidth pendingLabel="Signing in...">
                    Quick log in as client
                  </FormSubmitButton>
                </form>
              </CardContent>
            </Card>
          ) : null}

          {isDemoMode ? (
            <Card>
              <CardHeader>
                <CardTitle>Demo access</CardTitle>
                <CardDescription>
                  Use these local preview details while live auth is turned off.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="surface-muted p-4 text-sm">
                    <p className="font-semibold text-slate-900">Coach</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Email</p>
                    <p className="mt-1 font-mono text-[0.8rem] font-medium text-slate-900 sm:text-sm">
                      {demoCoachCredentials.email}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      Password
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {demoCoachCredentials.password}
                    </p>
                  </div>

                  <div className="surface-muted p-4 text-sm">
                    <p className="font-semibold text-slate-900">Client</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Name</p>
                    <p className="mt-1 font-medium text-slate-900">
                      {demoClientCredentials.fullName}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">
                      Access code
                    </p>
                    <p className="mt-1 font-mono text-[0.8rem] font-medium text-slate-900 sm:text-sm">
                      {demoClientCredentials.inviteToken}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:flex sm:flex-wrap">
                  <Link
                    href={`/access?code=${demoClientCredentials.inviteToken}`}
                    className="block w-full sm:inline-block sm:w-auto"
                  >
                    <Button variant="secondary" fullWidth>
                      Open client access
                    </Button>
                  </Link>
                  <Link href="/preview/client" className="block w-full sm:inline-block sm:w-auto">
                    <Button variant="ghost" fullWidth>
                      Open client preview
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}

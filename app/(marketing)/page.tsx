import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, KeyRound, LockKeyhole, Users } from "lucide-react";

import { loginAppAction } from "@/app/actions/auth";
import { CoachLoginForm } from "@/components/forms/coach-login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedAppPath } from "@/lib/auth";
import { demoClientCredentials, demoCoachCredentials } from "@/lib/demo/credentials";
import { isLiveAppEnabled } from "@/lib/supabase/config";

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
    <main className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="order-2 space-y-5 lg:order-1">
          <p className="eyebrow">Pure Physique</p>
          <h1 className="font-display text-[1.95rem] leading-[0.94] text-slate-900 sm:text-5xl lg:text-6xl">
            <span className="block">Small check-ins.</span>
            <span className="block">Real momentum.</span>
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
            One workspace for coach decisions, one clear entry for client follow-through, and a
            daily rhythm built around consistency instead of clutter.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="tap-card">
              <Activity className="h-5 w-5 text-accent-teal" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Daily visibility</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                See who checked in, who slipped, and where to follow up next.
              </p>
            </div>
            <div className="tap-card">
              <Users className="h-5 w-5 text-accent-coral" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Coach workspace</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Manage clients, targets, access codes, and progress from one roster.
              </p>
            </div>
            <div className="tap-card">
              <KeyRound className="h-5 w-5 text-accent-gold" />
              <p className="mt-3 text-sm font-semibold text-slate-900">First-time setup</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Clients claim the account once with a coach-issued access code.
              </p>
            </div>
            <div className="tap-card">
              <LockKeyhole className="h-5 w-5 text-accent-magenta" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Return sign-in</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                After claim, clients log in normally with email and password.
              </p>
            </div>
          </div>
        </section>

        <div className="order-1 mx-auto w-full max-w-md space-y-4 lg:order-2">
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

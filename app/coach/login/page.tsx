import Link from "next/link";
import { redirect } from "next/navigation";
import { Activity, KeyRound, Users } from "lucide-react";

import { loginCoachAction } from "@/app/actions/auth";
import { CoachLoginForm } from "@/components/forms/coach-login-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedAppPath } from "@/lib/auth";
import { demoClientCredentials, demoCoachCredentials } from "@/lib/demo/credentials";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default async function CoachLoginPage({
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
  const isDemoMode = !isLiveAppEnabled;

  return (
    <main className="page-shell">
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
        <section className="order-2 space-y-5 lg:order-1">
          <p className="eyebrow">Coach access</p>
          <h1 className="font-display text-[2.1rem] leading-[0.96] text-slate-900 sm:text-5xl lg:text-6xl">
            Sign in and manage the whole coaching roster from one place.
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
            The core coach views should stay readable and actionable from a phone first, then
            expand naturally on larger screens.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="tap-card">
              <Activity className="h-5 w-5 text-accent-teal" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Daily check-ins</p>
            </div>
            <div className="tap-card">
              <Users className="h-5 w-5 text-accent-coral" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Client follow-up</p>
            </div>
            <div className="tap-card">
              <KeyRound className="h-5 w-5 text-accent-gold" />
              <p className="mt-3 text-sm font-semibold text-slate-900">Private access</p>
            </div>
          </div>
        </section>

        <div className="order-1 mx-auto w-full max-w-md space-y-4 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>Coach login</CardTitle>
              <CardDescription>
                Sign in to open the dashboard, clients, and reminders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error ? (
                <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  {decodeURIComponent(error)}
                </div>
              ) : null}
              <CoachLoginForm
                action={loginCoachAction}
                defaultEmail={isDemoMode ? demoCoachCredentials.email : undefined}
                defaultPassword={isDemoMode ? demoCoachCredentials.password : undefined}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Testing access</CardTitle>
              <CardDescription>
                {isDemoMode
                  ? "Use these demo details while previewing the app locally."
                  : "These are local preview details. If live auth is configured, use the real coach account instead."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="surface-muted p-4 text-sm">
                  <p className="font-semibold text-slate-900">Coach email</p>
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
                  <p className="font-semibold text-slate-900">Client test access</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Client</p>
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
        </div>
      </div>
    </main>
  );
}

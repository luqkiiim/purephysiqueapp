import Link from "next/link";
import { Settings } from "lucide-react";

import { ActiveNav } from "@/components/layout/active-nav";
import { CoachMobileNavigation } from "@/components/layout/coach-mobile-tabs";
import { DemoBanner } from "@/components/layout/demo-banner";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

export function CoachShell({
  heading,
  subheading,
  demoMode,
  children,
  actions,
}: {
  heading: string;
  subheading?: string;
  demoMode: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <CoachMobileNavigation>
      <header className="surface-card overflow-hidden p-4 sm:p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-3">
            <Link href="/" className="eyebrow">
              Pure Physique
            </Link>
            <div className="max-w-3xl space-y-3">
              <h1 className="section-title">{heading}</h1>
              {subheading ? (
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  {subheading}
                </p>
              ) : null}
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <nav className="hidden gap-2 overflow-x-auto pb-1 sm:flex sm:flex-wrap sm:items-center sm:overflow-visible sm:pb-0">
              <ActiveNav href="/coach" label="Overview" icon="dashboard" />
              <ActiveNav href="/coach/clients" label="Clients" icon="users" />
              <ActiveNav href="/coach/review" label="Review" icon="review" />
            </nav>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {actions}
              <Link
                href="/coach/settings"
                aria-label="Coach settings"
                title="Settings"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-50 text-slate-900 transition hover:border-accent-teal/30 hover:bg-slate-100"
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Settings</span>
              </Link>
              <form action={logoutAction} className="w-full sm:w-auto">
                <Button variant="secondary" size="sm" type="submit" fullWidth>
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>
      <DemoBanner enabled={demoMode} />
      {children}
    </CoachMobileNavigation>
  );
}

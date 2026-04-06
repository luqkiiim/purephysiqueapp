import Link from "next/link";

import { ActiveNav } from "@/components/layout/active-nav";
import { DemoBanner } from "@/components/layout/demo-banner";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/app/actions/auth";

export function CoachShell({
  heading,
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
    <div className="page-shell space-y-6">
      <header className="surface-card overflow-hidden p-4 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Link href="/" className="eyebrow">
              Pure Physique
            </Link>
            <h1 className="section-title">{heading}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav className="flex flex-wrap items-center gap-2">
              <ActiveNav href="/coach" label="Overview" icon="dashboard" />
              <ActiveNav href="/coach/clients" label="Clients" icon="users" />
              <ActiveNav href="/coach/settings" label="Settings" icon="settings" />
            </nav>
            {actions}
            <form action={logoutAction}>
              <Button variant="secondary" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <DemoBanner enabled={demoMode} />
      {children}
    </div>
  );
}

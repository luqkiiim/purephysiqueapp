"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Children, type ReactNode } from "react";

import { logoutAction } from "@/app/actions/auth";
import { DemoBanner } from "@/components/layout/demo-banner";
import {
  getSnapTabIndexFromPath,
  SnapBottomTabs,
  SnapTabbedNavigation,
  SnapTopTabs,
  type SnapTab,
} from "@/components/layout/snap-tabs";
import { Button } from "@/components/ui/button";

export type CoachPrimaryTab = "overview" | "clients" | "review";

type CoachTab = SnapTab & {
  id: CoachPrimaryTab;
  href: "/coach" | "/coach/clients" | "/coach/review";
  heading: string;
  subheading: string;
  Icon: LucideIcon;
  action?: {
    href: "/coach/clients" | "/coach/clients/new";
    label: string;
    variant: "coral" | "secondary";
  };
};

const coachTabs: CoachTab[] = [
  {
    id: "overview",
    href: "/coach",
    label: "Overview",
    heading: "Overview",
    subheading:
      "Track who logged today, spot missed check-ins early, and keep momentum visible across the roster without managing profiles from this screen.",
    Icon: LayoutDashboard,
    action: {
      href: "/coach/clients/new",
      label: "Add client",
      variant: "coral",
    },
  },
  {
    id: "clients",
    href: "/coach/clients",
    label: "Clients",
    heading: "Clients",
    subheading:
      "This is the roster-management home for profiles, access codes, targets, and direct links into each client record.",
    Icon: Users,
    action: {
      href: "/coach/clients/new",
      label: "New client",
      variant: "coral",
    },
  },
  {
    id: "review",
    href: "/coach/review",
    label: "Review",
    heading: "Review",
    subheading:
      "Work the daily coaching queue from missed logs, fresh check-ins, and progress-photo signals.",
    Icon: ClipboardCheck,
    action: {
      href: "/coach/clients",
      label: "Open clients",
      variant: "secondary",
    },
  },
];

const coachShellTabs: SnapTab[] = [
  {
    ...coachTabs[0],
    match: (pathname) => pathname === "/coach",
  },
  {
    ...coachTabs[1],
    match: (pathname) => pathname === "/coach/clients" || pathname.startsWith("/coach/clients/"),
  },
  {
    ...coachTabs[2],
    match: (pathname) => pathname === "/coach/review" || pathname.startsWith("/coach/review/"),
  },
];

function getIndexFromTab(tab: CoachPrimaryTab) {
  return Math.max(
    0,
    coachTabs.findIndex((entry) => entry.id === tab),
  );
}

function CoachSettingsLink() {
  return (
    <Link
      href="/coach/settings"
      aria-label="Coach settings"
      title="Settings"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-slate-50 text-slate-900 transition hover:border-accent-teal/30 hover:bg-slate-100"
    >
      <Settings className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">Settings</span>
    </Link>
  );
}

function CoachHeaderAction({ activeIndex }: { activeIndex: number }) {
  const action = coachTabs[activeIndex]?.action;

  if (!action) {
    return null;
  }

  return (
    <Link href={action.href} className="block min-w-0 sm:inline-block sm:w-auto">
      <Button variant={action.variant} size="sm" fullWidth>
        {action.label}
      </Button>
    </Link>
  );
}

function CoachHeader({
  activeIndex,
  actions,
}: {
  activeIndex: number;
  actions?: ReactNode;
}) {
  const activeTab = coachTabs[activeIndex] ?? coachTabs[0];

  return (
    <header className="surface-card overflow-hidden p-4 sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          <Link href="/" className="eyebrow">
            Pure Physique
          </Link>
          <div className="max-w-3xl space-y-3">
            <h1 className="section-title">{activeTab.heading}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {activeTab.subheading}
            </p>
          </div>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <SnapTopTabs tabs={coachTabs} activeIndex={activeIndex} />
          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:flex sm:flex-wrap sm:justify-end">
            {actions ?? <CoachHeaderAction activeIndex={activeIndex} />}
            <CoachSettingsLink />
            <form action={logoutAction} className="w-auto">
              <Button variant="secondary" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

export function CoachMobileNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeIndex = getSnapTabIndexFromPath(coachShellTabs, pathname);

  return (
    <>
      <div className="page-shell overflow-x-clip pb-32 sm:overflow-visible sm:pb-12">
        <div className="space-y-6">{children}</div>
      </div>
      <SnapBottomTabs tabs={coachShellTabs} activeIndex={activeIndex} ariaLabel="Coach navigation" />
    </>
  );
}

export function CoachTabbedNavigation({
  initialTab,
  demoMode,
  children,
}: {
  initialTab: CoachPrimaryTab;
  demoMode: boolean;
  children: ReactNode;
}) {
  const initialIndex = getIndexFromTab(initialTab);
  const panels = Children.toArray(children);

  return (
    <div className="page-shell pb-32 sm:pb-12">
      <div className="space-y-6">
        <SnapTabbedNavigation
          tabs={coachTabs}
          initialIndex={initialIndex}
          ariaLabel="Coach navigation"
          header={(activeIndex) => (
            <>
              <CoachHeader activeIndex={activeIndex} />
              <DemoBanner enabled={demoMode} />
            </>
          )}
        >
          {panels}
        </SnapTabbedNavigation>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  LayoutDashboard,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { logoutAction } from "@/app/actions/auth";
import { DemoBanner } from "@/components/layout/demo-banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CoachPrimaryTab = "overview" | "clients" | "review";

type CoachTab = {
  id: CoachPrimaryTab;
  href: "/coach" | "/coach/clients" | "/coach/review";
  label: string;
  heading: string;
  subheading: string;
  Icon: LucideIcon;
  action?: {
    href: "/coach/clients" | "/coach/clients/new";
    label: string;
    variant: "coral" | "secondary";
  };
};

type SwipeGesture = {
  pointerId: number;
  startX: number;
  startY: number;
  lock: "undecided" | "horizontal" | "vertical";
  source: "content" | "tabs";
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

function getIndexFromTab(tab: CoachPrimaryTab) {
  return Math.max(
    0,
    coachTabs.findIndex((entry) => entry.id === tab),
  );
}

function getExactCoachTabIndex(pathname: string) {
  const index = coachTabs.findIndex((tab) => tab.href === pathname);
  return index >= 0 ? index : null;
}

function getCoachBottomTabIndex(pathname: string) {
  if (pathname === "/coach") {
    return 0;
  }

  if (pathname === "/coach/clients" || pathname.startsWith("/coach/clients/")) {
    return 1;
  }

  if (pathname === "/coach/review" || pathname.startsWith("/coach/review/")) {
    return 2;
  }

  return null;
}

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
}

function shouldIgnoreSwipeStart(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(
    target.closest(
      [
        "a",
        "button",
        "input",
        "select",
        "textarea",
        "form",
        "[contenteditable='true']",
        "[data-swipe-ignore='true']",
        "[role='button']",
      ].join(","),
    ),
  );
}

function getSwipeThreshold() {
  return Math.min(112, Math.max(56, window.innerWidth * 0.22));
}

function applyEdgeResistance(deltaX: number, currentIndex: number) {
  const swipingBeforeFirst = currentIndex === 0 && deltaX > 0;
  const swipingAfterLast = currentIndex === coachTabs.length - 1 && deltaX < 0;
  const maxTravel = window.innerWidth * 0.9;
  const resistedDelta = swipingBeforeFirst || swipingAfterLast ? deltaX * 0.32 : deltaX;

  return Math.max(-maxTravel, Math.min(maxTravel, resistedDelta));
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
    <Link href={action.href} className="block w-full sm:inline-block sm:w-auto">
      <Button variant={action.variant} size="sm" fullWidth>
        {action.label}
      </Button>
    </Link>
  );
}

function CoachTopNav({ activeIndex }: { activeIndex: number }) {
  return (
    <nav className="hidden gap-2 overflow-x-auto pb-1 sm:flex sm:flex-wrap sm:items-center sm:overflow-visible sm:pb-0">
      {coachTabs.map((tab, index) => {
        const active = index === activeIndex;
        const Icon = tab.Icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold leading-tight transition",
              active
                ? "bg-accent-coral text-[#2d2e2d] shadow-soft"
                : "text-slate-700 hover:bg-accent-teal/10 hover:text-slate-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
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
          <CoachTopNav activeIndex={activeIndex} />
          <div className="flex flex-wrap items-center justify-end gap-2">
            {actions ?? <CoachHeaderAction activeIndex={activeIndex} />}
            <CoachSettingsLink />
            <form action={logoutAction} className="w-full sm:w-auto">
              <Button variant="secondary" size="sm" type="submit" fullWidth>
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}

function CoachBottomTabs({
  activeIndex,
  onSelect,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClickCapture,
}: {
  activeIndex: number | null;
  onSelect?: (index: number, event: ReactMouseEvent<HTMLAnchorElement>) => void;
  onPointerDown?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp?: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel?: (event: ReactPointerEvent<HTMLElement>) => void;
  onClickCapture?: (event: ReactMouseEvent<HTMLElement>) => void;
}) {
  return (
    <nav
      aria-label="Coach navigation"
      data-swipe-ignore="true"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      onClickCapture={onClickCapture}
      className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-sm border-t border-white/10 bg-[rgba(10,10,10,0.96)] px-5 pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur sm:hidden"
    >
      <div className="grid grid-cols-3 gap-3">
        {coachTabs.map((tab, index) => {
          const active = index === activeIndex;
          const Icon = tab.Icon;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-label={tab.label}
              aria-current={active ? "page" : undefined}
              onClick={(event) => onSelect?.(index, event)}
              className={cn(
                "inline-flex h-14 min-w-0 items-center justify-center rounded-[1.15rem] transition",
                active
                  ? "bg-accent-coral text-[#2d2e2d] shadow-soft"
                  : "text-slate-600 hover:bg-white/10 hover:text-slate-900",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="sr-only">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function CoachMobileNavigation({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeIndex = getCoachBottomTabIndex(pathname);

  return (
    <>
      <div className="page-shell overflow-x-clip pb-32 sm:overflow-visible sm:pb-12">
        <div className="space-y-6">{children}</div>
      </div>
      <CoachBottomTabs activeIndex={activeIndex} />
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
  const pathname = usePathname();
  const router = useRouter();
  const initialIndex = getIndexFromTab(initialTab);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeIndexRef = useRef(initialIndex);
  const gestureRef = useRef<SwipeGesture | null>(null);
  const frameRef = useRef<number | null>(null);
  const nextDragXRef = useRef(0);
  const settleTimerRef = useRef<number | null>(null);
  const tabClickTimerRef = useRef<number | null>(null);
  const suppressTabClickRef = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const panels = Children.toArray(children);

  useEffect(() => {
    const nextIndex = getExactCoachTabIndex(pathname);

    if (nextIndex === null || nextIndex === activeIndexRef.current) {
      return;
    }

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    setDragX(0);
    setIsDragging(false);
    setIsSettling(true);
  }, [pathname]);

  useEffect(() => {
    const handlePopState = () => {
      const nextIndex = getExactCoachTabIndex(window.location.pathname);

      if (nextIndex === null) {
        const target =
          `${window.location.pathname}${window.location.search}${window.location.hash}` as Route;
        router.replace(target);
        return;
      }

      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
      setDragX(0);
      setIsDragging(false);
      setIsSettling(true);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }

      if (tabClickTimerRef.current !== null) {
        window.clearTimeout(tabClickTimerRef.current);
      }
    };
  }, []);

  const setVisualDrag = (nextDragX: number) => {
    nextDragXRef.current = nextDragX;

    if (frameRef.current !== null) {
      return;
    }

    frameRef.current = window.requestAnimationFrame(() => {
      setDragX(nextDragXRef.current);
      frameRef.current = null;
    });
  };

  const startSettling = () => {
    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }

    setIsSettling(true);

    settleTimerRef.current = window.setTimeout(() => {
      setIsSettling(false);
      settleTimerRef.current = null;
    }, 220);
  };

  const snapBack = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setIsDragging(false);
    setDragX(0);
    startSettling();
  };

  const suppressTabClickBriefly = () => {
    suppressTabClickRef.current = true;

    if (tabClickTimerRef.current !== null) {
      window.clearTimeout(tabClickTimerRef.current);
    }

    tabClickTimerRef.current = window.setTimeout(() => {
      suppressTabClickRef.current = false;
      tabClickTimerRef.current = null;
    }, 350);
  };

  const commitTab = (nextIndex: number, historyMode: "push" | "replace" = "push") => {
    if (nextIndex < 0 || nextIndex >= coachTabs.length) {
      snapBack();
      return;
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
    setDragX(0);
    setIsDragging(false);
    startSettling();

    const href = coachTabs[nextIndex].href;

    if (window.location.pathname !== href || window.location.search || window.location.hash) {
      if (historyMode === "replace") {
        window.history.replaceState(null, "", href);
      } else {
        window.history.pushState(null, "", href);
      }
    }
  };

  const startGesture = (
    event: ReactPointerEvent<HTMLElement>,
    source: SwipeGesture["source"],
    ignoreInteractiveControls: boolean,
  ) => {
    if (
      !isMobileViewport() ||
      !event.isPrimary ||
      (ignoreInteractiveControls && shouldIgnoreSwipeStart(event.target))
    ) {
      gestureRef.current = null;
      return;
    }

    gestureRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lock: "undecided",
      source,
    };

    setIsSettling(false);
  };

  const handleContentPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    startGesture(event, "content", true);
  };

  const handleTabPointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    startGesture(event, "tabs", false);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;

    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    const horizontalTravel = Math.abs(deltaX);
    const verticalTravel = Math.abs(deltaY);

    if (gesture.lock === "undecided") {
      if (horizontalTravel < 8 && verticalTravel < 8) {
        return;
      }

      if (verticalTravel > horizontalTravel * 1.15) {
        gesture.lock = "vertical";
        gestureRef.current = null;
        return;
      }

      if (horizontalTravel > verticalTravel * 1.2) {
        gesture.lock = "horizontal";
        setIsDragging(true);

        if (gesture.source === "tabs") {
          suppressTabClickBriefly();
        }

        if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.setPointerCapture(event.pointerId);
        }
      }
    }

    if (gesture.lock !== "horizontal") {
      return;
    }

    event.preventDefault();
    setVisualDrag(applyEdgeResistance(deltaX, activeIndexRef.current));
  };

  const handlePointerEnd = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    gestureRef.current = null;

    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (gesture.lock !== "horizontal") {
      return;
    }

    if (gesture.source === "tabs") {
      suppressTabClickBriefly();
    }

    const deltaX = event.clientX - gesture.startX;
    const horizontalTravel = Math.abs(deltaX);
    const nextIndex = deltaX < 0 ? activeIndexRef.current + 1 : activeIndexRef.current - 1;
    const canNavigate = nextIndex >= 0 && nextIndex < coachTabs.length;

    if (!canNavigate || horizontalTravel < getSwipeThreshold()) {
      snapBack();
      return;
    }

    commitTab(nextIndex);
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    gestureRef.current = null;

    if (!gesture || gesture.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (gesture.lock === "horizontal") {
      snapBack();
    }
  };

  const handleTabClickCapture = (event: ReactMouseEvent<HTMLElement>) => {
    if (!suppressTabClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    suppressTabClickRef.current = false;

    if (tabClickTimerRef.current !== null) {
      window.clearTimeout(tabClickTimerRef.current);
      tabClickTimerRef.current = null;
    }
  };

  const handleTabSelect = (index: number, event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    commitTab(index);
  };

  const transition = isDragging
    ? "none"
    : isSettling
      ? "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)"
      : "none";
  const trackStyle = {
    "--coach-tab-transform": `translate3d(calc(-${activeIndex * 100}% + ${Math.round(dragX)}px), 0, 0)`,
    "--coach-tab-transition": transition,
    willChange: isDragging || isSettling ? "transform" : undefined,
  } as CSSProperties;

  return (
    <>
      <div className="page-shell pb-32 sm:pb-12">
        <div className="space-y-6">
          <CoachHeader activeIndex={activeIndex} />
          <DemoBanner enabled={demoMode} />
          <div
            className="touch-pan-y overflow-x-clip sm:touch-auto sm:overflow-visible"
            onPointerDown={handleContentPointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerCancel}
          >
            <div
              className="flex [transform:var(--coach-tab-transform)] [transition:var(--coach-tab-transition)] sm:block sm:!transform-none sm:!transition-none"
              style={trackStyle}
            >
              {panels.map((panel, index) => (
                <section
                  key={index}
                  aria-hidden={index !== activeIndex}
                  inert={index !== activeIndex ? true : undefined}
                  className={cn(
                    "w-full shrink-0 space-y-6 sm:w-auto sm:shrink",
                    index === activeIndex ? "sm:block" : "sm:hidden",
                  )}
                >
                  {panel}
                </section>
              ))}
            </div>
          </div>
        </div>
      </div>
      <CoachBottomTabs
        activeIndex={activeIndex}
        onSelect={handleTabSelect}
        onPointerDown={handleTabPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleTabClickCapture}
      />
    </>
  );
}

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

type CoachTab = {
  href: "/coach" | "/coach/clients" | "/coach/settings";
  label: string;
  Icon: LucideIcon;
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
    href: "/coach",
    label: "Overview",
    Icon: LayoutDashboard,
  },
  {
    href: "/coach/clients",
    label: "Clients",
    Icon: Users,
  },
  {
    href: "/coach/settings",
    label: "Settings",
    Icon: Settings,
  },
];

function getCoachTabIndex(pathname: string) {
  if (pathname === "/coach/settings" || pathname.startsWith("/coach/settings/")) {
    return 2;
  }

  if (pathname === "/coach/clients" || pathname.startsWith("/coach/clients/")) {
    return 1;
  }

  return 0;
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

function CoachBottomTabs({
  activeIndex,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onClickCapture,
}: {
  activeIndex: number;
  onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => void;
  onClickCapture: (event: ReactMouseEvent<HTMLElement>) => void;
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
  const router = useRouter();
  const activeIndex = getCoachTabIndex(pathname);
  const gestureRef = useRef<SwipeGesture | null>(null);
  const frameRef = useRef<number | null>(null);
  const nextDragXRef = useRef(0);
  const settleTimerRef = useRef<number | null>(null);
  const routeTimerRef = useRef<number | null>(null);
  const tabClickTimerRef = useRef<number | null>(null);
  const suppressTabClickRef = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setDragX(0);
    setIsDragging(false);
    setIsSettling(false);
    setIsNavigating(false);
    gestureRef.current = null;
    suppressTabClickRef.current = false;
  }, [pathname]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }

      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }

      if (routeTimerRef.current !== null) {
        window.clearTimeout(routeTimerRef.current);
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

  const snapBack = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    setIsDragging(false);
    setIsNavigating(false);
    setIsSettling(true);
    setDragX(0);

    if (settleTimerRef.current !== null) {
      window.clearTimeout(settleTimerRef.current);
    }

    settleTimerRef.current = window.setTimeout(() => {
      setIsSettling(false);
      settleTimerRef.current = null;
    }, 220);
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

  const startGesture = (
    event: ReactPointerEvent<HTMLElement>,
    source: SwipeGesture["source"],
    ignoreInteractiveControls: boolean,
  ) => {
    if (
      !isMobileViewport() ||
      isNavigating ||
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

    if (!gesture || gesture.pointerId !== event.pointerId || isNavigating) {
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
    setVisualDrag(applyEdgeResistance(deltaX, activeIndex));
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
    const nextIndex = deltaX < 0 ? activeIndex + 1 : activeIndex - 1;
    const canNavigate = nextIndex >= 0 && nextIndex < coachTabs.length;

    if (!canNavigate || horizontalTravel < getSwipeThreshold()) {
      snapBack();
      return;
    }

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const exitX = deltaX < 0 ? -window.innerWidth * 0.95 : window.innerWidth * 0.95;

    setIsDragging(false);
    setIsSettling(false);
    setIsNavigating(true);
    setDragX(exitX);

    if (routeTimerRef.current !== null) {
      window.clearTimeout(routeTimerRef.current);
    }

    routeTimerRef.current = window.setTimeout(() => {
      router.push(coachTabs[nextIndex].href);
      routeTimerRef.current = null;
    }, 180);
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

  const contentStyle: CSSProperties = {
    transform: `translate3d(${Math.round(dragX)}px, 0, 0)`,
    transition: isDragging
      ? "none"
      : isNavigating
        ? "transform 180ms cubic-bezier(0.2, 0.8, 0.2, 1)"
        : isSettling
          ? "transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)"
          : undefined,
    willChange: isDragging || isNavigating || isSettling ? "transform" : undefined,
  };

  return (
    <>
      <div
        className="page-shell touch-pan-y overflow-x-clip pb-32 sm:touch-auto sm:overflow-visible sm:pb-12"
        onPointerDown={handleContentPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
      >
        <div className="space-y-6" style={contentStyle}>
          {children}
        </div>
      </div>
      <CoachBottomTabs
        activeIndex={activeIndex}
        onPointerDown={handleTabPointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleTabClickCapture}
      />
    </>
  );
}

"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Children,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

export type SnapTab = {
  href: Route;
  label: string;
  Icon: LucideIcon;
  match?: (pathname: string) => boolean;
};

const heightBufferPx = 16;
const settleDelayMs = 180;
const realignDelayMs = 180;
const snapTolerancePx = 1;

function isMobileViewport() {
  return typeof window !== "undefined" && window.matchMedia("(max-width: 639px)").matches;
}

export function getSnapTabIndexFromPath(tabs: SnapTab[], pathname: string) {
  const index = tabs.findIndex((tab) => (tab.match ? tab.match(pathname) : pathname === tab.href));

  return index >= 0 ? index : null;
}

function clampIndex(index: number, panelCount: number) {
  return Math.max(0, Math.min(panelCount - 1, index));
}

export function SnapTopTabs({
  tabs,
  activeIndex,
  className,
}: {
  tabs: SnapTab[];
  activeIndex: number | null;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "hidden gap-2 overflow-x-auto pb-1 sm:flex sm:flex-wrap sm:items-center sm:overflow-visible sm:pb-0",
        className,
      )}
    >
      {tabs.map((tab, index) => {
        const active = index === activeIndex;
        const Icon = tab.Icon;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex min-w-0 shrink-0 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold leading-tight transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/30",
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

export function PathAwareSnapTopTabs({
  tabs,
  className,
}: {
  tabs: SnapTab[];
  className?: string;
}) {
  const pathname = usePathname();
  const activeIndex = getSnapTabIndexFromPath(tabs, pathname);

  return <SnapTopTabs tabs={tabs} activeIndex={activeIndex} className={className} />;
}

export function SnapBottomTabs({
  tabs,
  activeIndex,
  ariaLabel,
  maxWidthClassName,
  onSelect,
}: {
  tabs: SnapTab[];
  activeIndex: number | null;
  ariaLabel: string;
  maxWidthClassName?: string;
  onSelect?: (index: number, event: ReactMouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn(
        "fixed inset-x-0 bottom-0 z-20 mx-auto w-full border-t border-white/10 bg-[rgba(10,10,10,0.96)] px-3 pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] backdrop-blur sm:hidden",
        maxWidthClassName ?? (tabs.length > 3 ? "max-w-md" : "max-w-sm"),
      )}
    >
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
        {tabs.map((tab, index) => {
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
                "inline-flex h-14 min-w-0 items-center justify-center rounded-[1.15rem] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal/30",
                active
                  ? "bg-accent-coral text-[#2d2e2d] shadow-soft"
                  : "text-slate-500 hover:bg-white/10 hover:text-slate-100",
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

export function SnapTabbedNavigation({
  tabs,
  initialIndex,
  ariaLabel,
  bottomMaxWidthClassName,
  header,
  children,
}: {
  tabs: SnapTab[];
  initialIndex: number;
  ariaLabel: string;
  bottomMaxWidthClassName?: string;
  header?: (activeIndex: number) => ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const panels = Children.toArray(children);
  const panelCount = panels.length;
  const safeInitialIndex = clampIndex(initialIndex, panelCount);
  const [settledIndex, setSettledIndex] = useState(safeInitialIndex);
  const [navIndex, setNavIndex] = useState(safeInitialIndex);
  const [panelHeights, setPanelHeights] = useState<number[]>([]);
  const settledIndexRef = useRef(safeInitialIndex);
  const navIndexRef = useRef(safeInitialIndex);
  const targetIndexRef = useRef<number | null>(null);
  const pendingHistoryModeRef = useRef<"push" | "replace" | "none">("push");
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<Array<HTMLElement | null>>([]);
  const settleTimerRef = useRef<number | null>(null);
  const activePanelHeight = panelHeights[settledIndex] ?? 0;
  const usesMeasuredHeight = activePanelHeight > 0;

  const commitRoute = useCallback(
    (index: number, historyMode: "push" | "replace" | "none") => {
      if (historyMode === "none") {
        return;
      }

      const href = tabs[index]?.href;

      if (!href || window.location.pathname === href) {
        return;
      }

      if (historyMode === "replace") {
        window.history.replaceState(null, "", href);
      } else {
        window.history.pushState(null, "", href);
      }
    },
    [tabs],
  );

  const updateNavIndex = useCallback(
    (index: number) => {
      const nextIndex = clampIndex(index, panelCount);

      if (nextIndex === navIndexRef.current) {
        return;
      }

      navIndexRef.current = nextIndex;
      setNavIndex(nextIndex);
    },
    [panelCount],
  );

  const commitSettledIndex = useCallback(
    (index: number, historyMode: "push" | "replace" | "none") => {
      const nextIndex = clampIndex(index, panelCount);

      targetIndexRef.current = null;
      updateNavIndex(nextIndex);

      if (nextIndex !== settledIndexRef.current) {
        settledIndexRef.current = nextIndex;
        setSettledIndex(nextIndex);
      }

      commitRoute(nextIndex, historyMode);
    },
    [commitRoute, panelCount, updateNavIndex],
  );

  const scrollToIndex = useCallback((index: number, behavior: ScrollBehavior = "smooth") => {
    const viewport = viewportRef.current;

    if (!viewport || !isMobileViewport()) {
      return;
    }

    viewport.scrollTo({
      left: viewport.clientWidth * index,
      behavior,
    });
  }, []);

  const settleToNearestPanel = useCallback(
    (historyMode: "push" | "replace" | "none") => {
      const viewport = viewportRef.current;

      if (!viewport || !isMobileViewport() || viewport.clientWidth <= 0) {
        commitSettledIndex(targetIndexRef.current ?? navIndexRef.current, historyMode);
        return;
      }

      const nextIndex = clampIndex(
        targetIndexRef.current ?? Math.round(viewport.scrollLeft / viewport.clientWidth),
        panelCount,
      );
      const targetLeft = viewport.clientWidth * nextIndex;
      const distanceFromSnap = Math.abs(viewport.scrollLeft - targetLeft);

      updateNavIndex(nextIndex);

      if (distanceFromSnap > snapTolerancePx) {
        targetIndexRef.current = nextIndex;
        viewport.scrollTo({
          left: targetLeft,
          behavior: "smooth",
        });

        if (settleTimerRef.current !== null) {
          window.clearTimeout(settleTimerRef.current);
        }

        settleTimerRef.current = window.setTimeout(() => {
          settleTimerRef.current = null;
          settleToNearestPanel(historyMode);
        }, realignDelayMs);
        return;
      }

      commitSettledIndex(nextIndex, historyMode);
    },
    [commitSettledIndex, panelCount, updateNavIndex],
  );

  const scheduleSettle = useCallback(
    (historyMode: "push" | "replace" | "none", delay = settleDelayMs) => {
      pendingHistoryModeRef.current = historyMode;

      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }

      settleTimerRef.current = window.setTimeout(() => {
        settleTimerRef.current = null;
        settleToNearestPanel(pendingHistoryModeRef.current);
      }, delay);
    },
    [settleToNearestPanel],
  );

  const syncTargetIndex = useCallback(
    (index: number, historyMode: "push" | "replace" | "none", behavior: ScrollBehavior = "smooth") => {
      const nextIndex = clampIndex(index, panelCount);

      targetIndexRef.current = nextIndex;
      pendingHistoryModeRef.current = historyMode;
      updateNavIndex(nextIndex);
      scrollToIndex(nextIndex, behavior);

      if (!isMobileViewport()) {
        commitSettledIndex(nextIndex, historyMode);
        return;
      }

      scheduleSettle(historyMode, behavior === "auto" ? 40 : settleDelayMs);
    },
    [commitSettledIndex, panelCount, scheduleSettle, scrollToIndex, updateNavIndex],
  );

  useLayoutEffect(() => {
    panelRefs.current = panelRefs.current.slice(0, panelCount);

    const updateMeasurements = () => {
      const nextHeights = Array.from({ length: panelCount }, (_, index) => {
        const panel = panelRefs.current[index];
        return panel ? Math.ceil(panel.scrollHeight) : 0;
      });

      setPanelHeights((currentHeights) => {
        const hasChanged =
          currentHeights.length !== nextHeights.length ||
          currentHeights.some((height, index) => height !== nextHeights[index]);

        return hasChanged ? nextHeights : currentHeights;
      });
    };

    updateMeasurements();

    const observer = new ResizeObserver(updateMeasurements);

    panelRefs.current.forEach((panel) => {
      if (panel) {
        observer.observe(panel);
      }
    });

    window.addEventListener("resize", updateMeasurements);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateMeasurements);
    };
  }, [panelCount]);

  useLayoutEffect(() => {
    scrollToIndex(settledIndexRef.current, "auto");
  }, [scrollToIndex]);

  useEffect(() => {
    const nextIndex = getSnapTabIndexFromPath(tabs, pathname);

    if (
      nextIndex === null ||
      (nextIndex === settledIndexRef.current && nextIndex === navIndexRef.current)
    ) {
      return;
    }

    syncTargetIndex(nextIndex, "none", "auto");
  }, [pathname, syncTargetIndex, tabs]);

  useEffect(() => {
    const handlePopState = () => {
      const nextIndex = getSnapTabIndexFromPath(tabs, window.location.pathname);

      if (nextIndex === null) {
        const target =
          `${window.location.pathname}${window.location.search}${window.location.hash}` as Route;
        router.replace(target);
        return;
      }

      syncTargetIndex(nextIndex, "none", "smooth");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router, syncTargetIndex, tabs]);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const handleScrollEnd = () => {
      settleToNearestPanel(pendingHistoryModeRef.current);
    };

    viewport.addEventListener("scrollend", handleScrollEnd);

    return () => {
      viewport.removeEventListener("scrollend", handleScrollEnd);
    };
  }, [settleToNearestPanel]);

  useEffect(() => {
    return () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    const viewport = viewportRef.current;

    if (!viewport || !isMobileViewport() || viewport.clientWidth <= 0) {
      return;
    }

    const nextIndex = clampIndex(
      targetIndexRef.current ?? Math.round(viewport.scrollLeft / viewport.clientWidth),
      panelCount,
    );

    updateNavIndex(nextIndex);
    scheduleSettle(targetIndexRef.current === null ? "push" : pendingHistoryModeRef.current);
  };

  const handleTabSelect = (index: number, event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    event.preventDefault();
    syncTargetIndex(index, "push", "smooth");
  };

  const viewportStyle = {
    "--snap-tabs-height": usesMeasuredHeight
      ? `${activePanelHeight + heightBufferPx}px`
      : "auto",
  } as CSSProperties;

  return (
    <>
      {header?.(settledIndex)}
      <div
        ref={viewportRef}
        data-snap-tab-viewport="true"
        data-snap-nav-index={navIndex}
        data-snap-settled-index={settledIndex}
        className="overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory overscroll-x-contain [height:var(--snap-tabs-height)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:h-auto sm:overflow-visible"
        style={viewportStyle}
        onScroll={handleScroll}
      >
        <div className="flex items-start sm:block">
          {panels.map((panel, index) => {
            const active = index === settledIndex;

            return (
              <section
                key={index}
                ref={(element) => {
                  panelRefs.current[index] = element;
                }}
                data-snap-tab-panel="true"
                data-snap-panel-index={index}
                aria-hidden={!active}
                inert={!active ? true : undefined}
                className={cn(
                  "w-full flex-none snap-start snap-always sm:w-auto",
                  active ? "sm:block" : "sm:hidden",
                )}
              >
                {panel}
              </section>
            );
          })}
        </div>
      </div>
      <SnapBottomTabs
        tabs={tabs}
        activeIndex={navIndex}
        ariaLabel={ariaLabel}
        maxWidthClassName={bottomMaxWidthClassName}
        onSelect={handleTabSelect}
      />
    </>
  );
}

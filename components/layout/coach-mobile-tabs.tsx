"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Settings, Users, type LucideIcon } from "lucide-react";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

type CoachTab = {
  href: "/coach" | "/coach/clients" | "/coach/settings";
  label: string;
  Icon: LucideIcon;
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
        "[contenteditable='true']",
        "[data-swipe-ignore='true']",
        "[role='button']",
      ].join(","),
    ),
  );
}

export function CoachMobileTabs() {
  const pathname = usePathname();
  const router = useRouter();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 639px)");

    const handleTouchStart = (event: TouchEvent) => {
      if (!mobileQuery.matches || event.touches.length !== 1 || shouldIgnoreSwipeStart(event.target)) {
        touchStartRef.current = null;
        return;
      }

      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;

      if (!start || !mobileQuery.matches || event.changedTouches.length !== 1) {
        return;
      }

      const touch = event.changedTouches[0];
      const deltaX = touch.clientX - start.x;
      const deltaY = touch.clientY - start.y;
      const horizontalTravel = Math.abs(deltaX);
      const verticalTravel = Math.abs(deltaY);
      const threshold = Math.min(84, Math.max(48, window.innerWidth * 0.18));

      if (horizontalTravel < threshold || horizontalTravel < verticalTravel * 1.35) {
        return;
      }

      const currentIndex = getCoachTabIndex(pathname);
      const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;

      if (nextIndex < 0 || nextIndex >= coachTabs.length) {
        return;
      }

      router.push(coachTabs[nextIndex].href);
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [pathname, router]);

  const activeIndex = getCoachTabIndex(pathname);

  return (
    <nav
      aria-label="Coach navigation"
      data-swipe-ignore="true"
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

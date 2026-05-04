"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Camera,
  ChartSpline,
  ClipboardCheck,
  Home,
  LayoutDashboard,
  MessagesSquare,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navIcons = {
  dashboard: LayoutDashboard,
  users: Users,
  review: ClipboardCheck,
  settings: Settings,
  home: Home,
  history: ChartSpline,
  weekly: Activity,
  photos: Camera,
  messages: MessagesSquare,
} satisfies Record<string, LucideIcon>;

type ActiveNavIcon = keyof typeof navIcons;

export function ActiveNav({
  href,
  label,
  icon,
  mobile = false,
}: {
  href: Route;
  label: string;
  icon: ActiveNavIcon;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const Icon = navIcons[icon];
  const active =
    pathname === href ||
    ((href !== "/coach" && href !== "/client") && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex min-w-0 shrink-0 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold leading-tight transition sm:gap-2 sm:px-4 sm:text-sm",
        active
          ? "bg-accent-coral text-[#2d2e2d] shadow-soft"
          : "text-slate-700 hover:bg-accent-teal/10 hover:text-slate-900",
        mobile &&
          "h-14 w-full min-w-0 shrink flex-col rounded-[1.15rem] px-0 py-2 text-center sm:h-auto sm:flex-row sm:gap-2 sm:rounded-full sm:px-3 sm:py-2.5 sm:text-xs",
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", mobile && "h-5 w-5 sm:h-4 sm:w-4")} />
      <span className={cn("min-w-0 whitespace-nowrap", mobile && "sr-only sm:not-sr-only")}>
        {label}
      </span>
    </Link>
  );
}

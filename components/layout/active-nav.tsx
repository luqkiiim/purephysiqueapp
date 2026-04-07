"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Camera,
  ChartSpline,
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
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition",
        active
          ? "bg-accent-coral text-[#2d2e2d] shadow-soft"
          : "text-slate-700 hover:bg-accent-gold/15",
        mobile && "w-full justify-center px-3 py-2.5 text-xs",
      )}
    >
      <Icon className={mobile ? "h-4 w-4" : "h-4 w-4"} />
      <span>{label}</span>
    </Link>
  );
}

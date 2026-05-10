"use client";

import {
  Activity,
  Camera,
  ChartSpline,
  Home,
  MessagesSquare,
} from "lucide-react";
import { Children, type ReactNode } from "react";

import {
  getSnapTabIndexFromPath,
  PathAwareSnapTopTabs,
  SnapTabbedNavigation,
  type SnapTab,
} from "@/components/layout/snap-tabs";

export type ClientPrimaryTab = "check-in" | "history" | "weekly" | "photos" | "messages";

export const clientTabs: Array<SnapTab & { id: ClientPrimaryTab }> = [
  {
    id: "check-in",
    href: "/client",
    label: "Check in",
    Icon: Home,
  },
  {
    id: "history",
    href: "/client/history",
    label: "History",
    Icon: ChartSpline,
  },
  {
    id: "weekly",
    href: "/client/weekly",
    label: "Weekly",
    Icon: Activity,
  },
  {
    id: "photos",
    href: "/client/photos",
    label: "Photos",
    Icon: Camera,
  },
  {
    id: "messages",
    href: "/client/messages",
    label: "Messages",
    Icon: MessagesSquare,
  },
];

export function getClientTabIndex(tab: ClientPrimaryTab) {
  return Math.max(
    0,
    clientTabs.findIndex((entry) => entry.id === tab),
  );
}

export function ClientTopTabs() {
  return <PathAwareSnapTopTabs tabs={clientTabs} />;
}

export function ClientTabbedNavigation({
  initialTab,
  children,
}: {
  initialTab: ClientPrimaryTab;
  children: ReactNode;
}) {
  const initialIndex = getClientTabIndex(initialTab);
  const panels = Children.toArray(children);

  return (
    <SnapTabbedNavigation
      tabs={clientTabs}
      initialIndex={initialIndex}
      ariaLabel="Client navigation"
      bottomMaxWidthClassName="max-w-md"
    >
      {panels}
    </SnapTabbedNavigation>
  );
}

export function getClientTabIndexFromPath(pathname: string) {
  return getSnapTabIndexFromPath(clientTabs, pathname);
}

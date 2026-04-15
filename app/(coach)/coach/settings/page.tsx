import { Database, Link2, ShieldCheck } from "lucide-react";

import { CoachShell } from "@/components/layout/coach-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isLiveAppEnabled } from "@/lib/supabase/config";

const settingsCards = [
  {
    title: "Manual access",
    description: "Client access is shared directly through the private link instead of outbound email flows.",
    icon: Link2,
    items: [
      "Use the client detail page to copy or open the private access link when you need to share it.",
      "Because access is link-based, setup stays lighter and avoids email deliverability issues.",
      "Coach notes and client-facing feedback remain clearly separated in the workflow.",
    ],
    badge: "Direct",
  },
  {
    title: "Client access security",
    description: "Private invite links keep the client flow direct without forcing a heavier sign-in experience.",
    icon: ShieldCheck,
    items: [
      "Invite tokens open the app directly, which keeps client access friction low on phones.",
      "Share the link manually only with the client who should have access.",
      "Coach notes and client-facing feedback remain clearly separated in the workflow.",
    ],
    badge: "Private",
  },
  {
    title: "Storage",
    description: "Photos and check-in history should remain lightweight so the app stays fast across devices.",
    icon: Database,
    items: [
      "Progress photos are optional and should support trend review rather than gallery browsing.",
      "Charts and recent entries surface the highest-signal data first on mobile.",
      "Keep uploads and long-term storage pragmatic until heavier reporting is actually needed.",
    ],
    badge: "Pragmatic",
  },
];

export default function CoachSettingsPage() {
  return (
    <CoachShell
      heading="Settings and access"
      subheading="Operational guidance for manual access sharing, storage, and access control in version one."
      demoMode={!isLiveAppEnabled}
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="surface-card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Access model</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Manual private link</p>
        </div>
        <div className="surface-card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Security model</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Private invite links</p>
        </div>
        <div className="surface-card p-4 sm:p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Data posture</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Lean and fast</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {settingsCards.map(({ title, description, icon: Icon, items, badge }) => (
          <Card key={title}>
            <CardHeader className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-teal/25 bg-accent-teal/10">
                  <Icon className="h-5 w-5 text-accent-teal" />
                </div>
                <Badge tone="neutral">{badge}</Badge>
              </div>
              <div className="space-y-2">
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item} className="surface-muted p-4">
                  <p className="text-sm leading-6 text-slate-700">{item}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>
    </CoachShell>
  );
}

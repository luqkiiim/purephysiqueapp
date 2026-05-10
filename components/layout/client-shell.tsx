import { Flame } from "lucide-react";

import { clearClientAccessAction } from "@/app/actions/access";
import { ClientTopTabs } from "@/components/layout/client-tabs";
import { DemoBanner } from "@/components/layout/demo-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ClientShell({
  clientName,
  streak,
  demoMode,
  children,
}: {
  clientName: string;
  streak: number;
  demoMode: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="page-shell space-y-5 pb-32 sm:pb-28">
      <header className="surface-card overflow-hidden p-4 sm:p-5">
        <div className="flex flex-col gap-5">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow">Daily check-in</p>
              <Badge tone="accent" className="gap-1.5 self-start">
                <Flame aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                {streak} day streak
              </Badge>
            </div>
            <h1 className="font-display text-[1.9rem] leading-[1.04] text-slate-900 sm:text-3xl">
              {clientName}
            </h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <ClientTopTabs />
            <form action={clearClientAccessAction}>
              <Button variant="ghost" size="sm" type="submit" fullWidth>
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

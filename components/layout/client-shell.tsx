import { clearClientAccessAction } from "@/app/actions/access";
import { ActiveNav } from "@/components/layout/active-nav";
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
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="eyebrow">Daily check-in</p>
              <Badge tone="accent" className="self-start">
                {streak} day streak
              </Badge>
            </div>
            <h1 className="font-display text-[1.9rem] leading-[1.04] text-slate-900 sm:text-3xl">
              {clientName}
            </h1>
          </div>
          <div className="grid gap-2 sm:justify-items-end">
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
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl border-t border-white/10 bg-[rgba(10,10,10,0.96)] px-3 pb-[calc(env(safe-area-inset-bottom,0)+0.75rem)] pt-2 shadow-[0_-8px_24px_rgba(0,0,0,0.35)] sm:rounded-t-4xl sm:border-x sm:backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-5 sm:overflow-visible sm:pb-0">
          <ActiveNav href="/client" label="Check in" icon="home" mobile />
          <ActiveNav href="/client/history" label="History" icon="history" mobile />
          <ActiveNav href="/client/weekly" label="Weekly" icon="weekly" mobile />
          <ActiveNav href="/client/photos" label="Photos" icon="photos" mobile />
          <ActiveNav href="/client/messages" label="Messages" icon="messages" mobile />
        </div>
      </nav>
    </div>
  );
}

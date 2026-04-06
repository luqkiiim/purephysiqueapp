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
    <div className="page-shell pb-28 space-y-5">
      <header className="surface-card overflow-hidden p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="eyebrow">Daily check-in</p>
            <h1 className="font-display text-3xl text-slate-900">{clientName}</h1>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Badge tone="accent">{streak} day streak</Badge>
            <form action={clearClientAccessAction}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <DemoBanner enabled={demoMode} />
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-xl border-t border-white/70 bg-white/95 px-3 py-3 shadow-[0_-8px_24px_rgba(29,43,42,0.08)] backdrop-blur sm:rounded-t-4xl sm:border-x">
        <div className="grid grid-cols-5 gap-2">
          <ActiveNav href="/client" label="Today" icon="home" mobile />
          <ActiveNav href="/client/history" label="History" icon="history" mobile />
          <ActiveNav href="/client/weekly" label="Weekly" icon="weekly" mobile />
          <ActiveNav href="/client/photos" label="Photos" icon="photos" mobile />
          <ActiveNav href="/client/messages" label="Messages" icon="messages" mobile />
        </div>
      </nav>
    </div>
  );
}

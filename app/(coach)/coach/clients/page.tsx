import Link from "next/link";

import { CoachShell } from "@/components/layout/coach-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoachDashboardData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default async function CoachClientsPage() {
  const data = await getCoachDashboardData();

  return (
    <CoachShell
      heading="Clients"
      subheading="Manage profiles, targets, invite links, and reminder settings across the full roster."
      demoMode={!isLiveAppEnabled}
      actions={
        <Link href="/coach/clients/new">
          <Button variant="coral" size="sm">
            New client
          </Button>
        </Link>
      }
    >
      <section className="grid gap-4">
        {data.clients.length ? (
          data.clients.map((client) => (
            <Card key={client.id}>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>{client.fullName}</CardTitle>
                  <CardDescription>{client.email}</CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/coach/clients/${client.id}`}>
                    <Button variant="secondary" size="sm">
                      Open detail
                    </Button>
                  </Link>
                  <Link href={`/coach/clients/${client.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-4">
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{client.statusLabel}</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Streak</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{client.streak} days</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Protein consistency</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{client.proteinConsistency}%</p>
                </div>
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Step consistency</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{client.stepConsistency}%</p>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No clients yet</CardTitle>
              <CardDescription>
                Start with one client profile, then add targets and send the private access link.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </section>
    </CoachShell>
  );
}

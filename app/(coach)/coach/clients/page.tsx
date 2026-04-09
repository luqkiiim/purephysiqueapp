import Link from "next/link";

import { CoachShell } from "@/components/layout/coach-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCoachClientsPageData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default async function CoachClientsPage() {
  const data = await getCoachClientsPageData();

  return (
    <CoachShell
      heading="Clients"
      subheading="Manage profiles, targets, invite links, and reminder settings across the full roster."
      demoMode={!isLiveAppEnabled}
      actions={
        <Link href="/coach/clients/new" className="block w-full sm:inline-block sm:w-auto">
          <Button variant="coral" size="sm" fullWidth>
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
                <div className="grid gap-2 sm:flex sm:flex-wrap">
                  <Link
                    href={`/coach/clients/${client.id}`}
                    className="block w-full sm:inline-block sm:w-auto"
                  >
                    <Button variant="secondary" size="sm" fullWidth>
                      Open detail
                    </Button>
                  </Link>
                  <Link
                    href={`/coach/clients/${client.id}/edit`}
                    className="block w-full sm:inline-block sm:w-auto"
                  >
                    <Button variant="ghost" size="sm" fullWidth>
                      Edit
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="surface-muted p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
                  <Badge
                    tone={
                      client.statusTone === "success"
                        ? "success"
                        : client.statusTone === "warning"
                          ? "warning"
                          : "neutral"
                    }
                    className="mt-2 self-start"
                  >
                    {client.statusLabel}
                  </Badge>
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

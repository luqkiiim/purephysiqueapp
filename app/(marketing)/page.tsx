import Link from "next/link";
import { Activity, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const landingCards = [
  {
    title: "Fast client logging",
    icon: Smartphone,
  },
  {
    title: "Clear coach overview",
    icon: Activity,
  },
  {
    title: "Private client access",
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
  return (
    <main className="page-shell space-y-6">
      <section className="surface-card overflow-hidden px-5 py-8 sm:px-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <p className="eyebrow">Pure Physique</p>
            <h1 className="font-display text-5xl leading-none text-slate-900 sm:text-6xl">
              Daily client check-ins, clear coach follow-up, no spreadsheet mess.
            </h1>
            <div className="flex flex-wrap gap-3">
              <Link href="/coach/login">
                <Button variant="primary" size="lg">
                  Coach login
                </Button>
              </Link>
              <Link href="/preview/client">
                <Button variant="teal" size="lg">
                  Client app
                </Button>
              </Link>
            </div>
          </div>

          <div className="surface-muted relative overflow-hidden p-6 shadow-float">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-coral/15 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-[#e43292]/16 blur-3xl" />
            <div className="relative space-y-4">
              <div className="tap-card animate-float">
                <p className="text-sm text-slate-500">Client check-in</p>
                <p className="mt-2 font-display text-3xl text-slate-900">Under 60 seconds</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="tap-card">
                  <p className="text-sm text-slate-500">Coach sees</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">Who logged today</p>
                </div>
                <div className="tap-card">
                  <p className="text-sm text-slate-500">Coach tracks</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">Streaks and trends</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {landingCards.map(({ title, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-mint">
                <Icon className="h-5 w-5 text-[#2d2e2d]" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </section>
    </main>
  );
}

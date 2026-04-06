import Link from "next/link";
import { Activity, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { demoClientCredentials } from "@/lib/demo/credentials";

const landingCards = [
  {
    title: "Fast client logging",
    description: "Sleep, protein, steps, workout, weight, and a quick note in one short flow.",
    icon: Smartphone,
  },
  {
    title: "Clear coach overview",
    description: "See who logged, who missed, and where to follow up without digging through sheets.",
    icon: Activity,
  },
  {
    title: "Private client access",
    description: "Clients come in through a private link that opens their check-in flow directly.",
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
            <div className="space-y-4">
              <h1 className="font-display text-5xl leading-none text-slate-900 sm:text-6xl">
                Daily client check-ins, clear coach follow-up, no spreadsheet mess.
              </h1>
              <p className="max-w-2xl text-base text-slate-700 sm:text-lg">
                Built for a coach who wants clients to log fast and stay consistent, while keeping the coach side simple to run.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/coach/login">
                <Button variant="primary" size="lg">
                  Coach login
                </Button>
              </Link>
              <Link href="/client">
                <Button variant="teal" size="lg">
                  Preview client app
                </Button>
              </Link>
              <Link href={`/access/${demoClientCredentials.inviteToken}`}>
                <Button variant="secondary" size="lg">
                  Demo client access
                </Button>
              </Link>
            </div>
            <p className="text-sm text-slate-600">
              Use the preview if you want to look around quickly, or open the client access flow to test the invite experience.
            </p>
          </div>

          <div className="surface-muted relative overflow-hidden p-6 shadow-float">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-coral/15 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent-teal/15 blur-3xl" />
            <div className="relative space-y-4">
              <div className="tap-card animate-float">
                <p className="text-sm text-slate-500">Client check-in</p>
                <p className="mt-2 font-display text-3xl text-slate-900">Under 60 seconds</p>
                <p className="mt-2 text-sm text-slate-700">
                  One focused screen for the habit that matters every day.
                </p>
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
        {landingCards.map(({ title, description, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-mint">
                <Icon className="h-5 w-5 text-slate-900" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">{description}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="surface-card p-6 sm:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="surface-muted p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Coach</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Dashboard, clients, reminders</p>
          </div>
          <div className="surface-muted p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Client</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Today, history, weekly, photos</p>
          </div>
          <div className="surface-muted p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Access</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">Private invite link</p>
          </div>
        </div>
      </section>
    </main>
  );
}

import Link from "next/link";
import { Activity, ShieldCheck, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

const landingCards = [
  {
    title: "Fast client logging",
    icon: Smartphone,
    description: "Built to be completed comfortably on a phone in under a minute.",
  },
  {
    title: "Clear coach overview",
    icon: Activity,
    description: "Mobile dashboards keep follow-up visible without spreadsheet density.",
  },
  {
    title: "Private client access",
    icon: ShieldCheck,
    description: "Invite links open straight into the check-in flow with minimal friction.",
  },
];

export default function LandingPage() {
  return (
    <main className="page-shell space-y-6">
      <section className="surface-card overflow-hidden px-4 py-6 sm:px-8 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="min-w-0 space-y-5">
            <p className="eyebrow">Pure Physique</p>
            <h1 className="text-safe-wrap font-display text-[2.2rem] leading-[0.96] text-slate-900 sm:text-5xl lg:text-6xl">
              Daily client check-ins, clear coach follow-up, no spreadsheet mess.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-700 sm:text-base">
              Designed for phone use first so clients can log quickly and coaches can act without
              pinching, zooming, or fighting cramped layouts.
            </p>
            <div className="grid w-full max-w-full gap-3 sm:flex sm:flex-wrap">
              <Link href="/coach/login" className="block w-full sm:inline-block sm:w-auto">
                <Button variant="primary" size="lg" fullWidth>
                  Coach login
                </Button>
              </Link>
              <Link href="/preview/client" className="block w-full sm:inline-block sm:w-auto">
                <Button variant="teal" size="lg" fullWidth>
                  Client app
                </Button>
              </Link>
            </div>
          </div>

          <div className="surface-muted relative overflow-hidden p-4 shadow-float sm:p-6">
            <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-coral/15 blur-3xl" />
            <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-accent-magenta/16 blur-3xl" />
            <div className="absolute right-12 top-20 h-24 w-24 rounded-full bg-accent-teal/14 blur-3xl" />
            <div className="relative space-y-4">
              <div className="tap-card animate-float">
                <p className="text-sm text-slate-500">Client check-in</p>
                <p className="mt-2 font-display text-[1.7rem] leading-[1.02] text-slate-900 sm:text-3xl">
                  Under 60 seconds
                </p>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Clear prompts, larger targets, and less crowding on narrow screens.
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

      <section className="mx-auto grid max-w-5xl gap-4 sm:gap-5 md:grid-cols-3">
        {landingCards.map(({ title, description, icon: Icon }) => (
          <Card key={title} className="h-full w-full max-w-[30rem] justify-self-center">
            <CardContent className="flex h-full flex-col items-center px-5 pb-5 pt-5 text-center sm:px-6 sm:pb-6 sm:pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-teal/25 bg-accent-teal/10">
                <Icon className="h-5 w-5 text-accent-teal" />
              </div>
              <div className="mt-4 space-y-2">
                <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
                <CardDescription className="mx-auto max-w-[18rem]">
                  {description}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </main>
  );
}

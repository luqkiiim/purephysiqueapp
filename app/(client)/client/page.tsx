import Link from "next/link";

import { saveDailyCheckInAction } from "@/app/actions/client";
import { DailyCheckInForm } from "@/components/forms/daily-checkin-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientCheckInPageData } from "@/lib/data/client";
import { formatFullDate } from "@/lib/utils";

export default async function ClientHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const data = await getClientCheckInPageData();
  const resolvedSearchParams = (await searchParams) ?? {};
  const submittedValue = resolvedSearchParams.submitted;
  const submitted = Array.isArray(submittedValue)
    ? submittedValue[0] === "1"
    : submittedValue === "1";

  return (
    <div className="space-y-5">
      <DailyCheckInForm
        action={saveDailyCheckInAction}
        defaults={data.todaysCheckIn ?? undefined}
        proteinTarget={data.client.targets.proteinTargetGrams}
        stepTarget={data.client.targets.stepTarget}
        probioticsEnabled={data.client.targets.probioticsEnabled}
        fishOilEnabled={data.client.targets.fishOilEnabled}
        streak={data.client.currentStreak}
        submitted={submitted}
        compactMode
        headerEyebrow="Quick check-in"
        headerDescription="Log the core numbers first. Extra detail stays optional."
        submitLabel="Save today's check-in"
      />

      <Card>
        <CardHeader>
          <CardTitle>{data.latestCoachUpdate ? "Latest from coach" : "Today's focus"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.latestCoachUpdate ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone={data.latestCoachUpdate.type === "message" ? "accent" : "neutral"}>
                  {data.latestCoachUpdate.type === "message" ? "Coach message" : "Shared note"}
                </Badge>
                <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                  {formatFullDate(data.latestCoachUpdate.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-700 sm:text-base">
                {data.latestCoachUpdate.content}
              </p>
              <Link href="/client/messages" className="block w-full sm:inline-block sm:w-auto">
                <Button variant="secondary" size="sm" fullWidth>
                  Open messages
                </Button>
              </Link>
            </>
          ) : (
            <p className="text-sm leading-6 text-slate-700 sm:text-base">
              {data.client.profile.welcomeMessage || "Keep today's check-in quick and consistent."}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

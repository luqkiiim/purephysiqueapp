import { saveDailyCheckInAction } from "@/app/actions/client";
import { DailyCheckInForm } from "@/components/forms/daily-checkin-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClientCheckInPageData } from "@/lib/data/client";

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
      />

      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s focus</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-700 sm:text-base">
            {data.client.profile.welcomeMessage || "Keep today's check-in quick and consistent."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

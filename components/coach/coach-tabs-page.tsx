import { CoachClientsPanel } from "@/components/coach/coach-clients-panel";
import { CoachOverviewPanel } from "@/components/coach/coach-overview-panel";
import { CoachReviewPanel } from "@/components/coach/coach-review-panel";
import {
  CoachTabbedNavigation,
  type CoachPrimaryTab,
} from "@/components/layout/coach-mobile-tabs";
import { getCoachTabsData } from "@/lib/data/coach";
import { isLiveAppEnabled } from "@/lib/supabase/config";

type CoachTabSearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSearchParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export async function CoachTabsPage({
  initialTab,
  searchParams,
}: {
  initialTab: CoachPrimaryTab;
  searchParams?: CoachTabSearchParams;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const deleted = getSearchParam(resolvedSearchParams, "deleted");
  const error = getSearchParam(resolvedSearchParams, "error");
  const data = await getCoachTabsData();

  return (
    <CoachTabbedNavigation initialTab={initialTab} demoMode={!isLiveAppEnabled}>
      <div className="space-y-6">
        <CoachOverviewPanel data={data.overview} />
      </div>
      <div className="space-y-6">
        <CoachClientsPanel data={data.clients} deleted={deleted} error={error} />
      </div>
      <div className="space-y-6">
        <CoachReviewPanel data={data.review} />
      </div>
    </CoachTabbedNavigation>
  );
}

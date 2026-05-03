import { CoachTabsPage } from "@/components/coach/coach-tabs-page";

export default function CoachClientsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <CoachTabsPage initialTab="clients" searchParams={searchParams} />;
}

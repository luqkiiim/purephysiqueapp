import { ClientTabsPage } from "@/components/client/client-tabs-page";

export default function ClientHomePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  return <ClientTabsPage initialTab="check-in" searchParams={searchParams} />;
}

import { ClientShell } from "@/components/layout/client-shell";
import { getClientHomeData } from "@/lib/data/client";
import { isLiveAppEnabled } from "@/lib/supabase/config";

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const data = await getClientHomeData();

  return (
    <ClientShell
      clientName={data.client.fullName}
      streak={data.client.currentStreak}
      demoMode={!isLiveAppEnabled}
    >
      {children}
    </ClientShell>
  );
}

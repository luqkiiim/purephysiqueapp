import { redirect } from "next/navigation";

import { formatAccessCode } from "@/lib/access-codes";

export default async function LegacyClientAccessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/access?code=${encodeURIComponent(formatAccessCode(token))}`);
}

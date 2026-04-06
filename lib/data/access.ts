import { demoClients } from "@/lib/demo/data";
import { getClientBundleByInviteToken } from "@/lib/database/queries";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { formatShortDate } from "@/lib/utils";

export async function getClientInviteData(inviteToken: string) {
  if (!isLiveAppEnabled) {
    const client = demoClients.find((entry) => entry.inviteToken === inviteToken);

    if (!client || client.activeStatus !== "active") {
      return null;
    }

    return {
      client,
      inviteLinkLabel: formatShortDate(client.createdAt),
    };
  }

  const client = await getClientBundleByInviteToken(inviteToken);

  if (!client || client.activeStatus !== "active") {
    return null;
  }

  return {
    client,
    inviteLinkLabel: formatShortDate(client.createdAt),
  };
}

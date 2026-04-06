import { redirect } from "next/navigation";

export default async function ClientInviteVerifyPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  redirect(`/access/${token}`);
}

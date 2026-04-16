import { redirect } from "next/navigation";

import { getAuthenticatedAppPath } from "@/lib/auth";

export default async function CoachLoginRedirectPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const authenticatedAppPath = await getAuthenticatedAppPath();

  if (authenticatedAppPath) {
    redirect(authenticatedAppPath);
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const errorValue = resolvedSearchParams.error;
  const error = Array.isArray(errorValue) ? errorValue[0] : errorValue;

  redirect(error ? `/?error=${encodeURIComponent(error)}` : "/");
}

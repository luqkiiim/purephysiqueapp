"use server";

import { redirect } from "next/navigation";

import { demoCoachCredentials } from "@/lib/demo/credentials";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isLiveAppEnabled } from "@/lib/supabase/config";
import { coachLoginSchema } from "@/lib/validation/forms";

export async function loginCoachAction(formData: FormData) {
  const rawValues = Object.fromEntries(formData.entries());

  if (!isLiveAppEnabled) {
    const values = coachLoginSchema.safeParse(rawValues);

    if (
      !values.success ||
      values.data.email.toLowerCase() !== demoCoachCredentials.email.toLowerCase() ||
      values.data.password !== demoCoachCredentials.password
    ) {
      redirect(
        `/coach/login?error=${encodeURIComponent(
          "Use the demo coach email and password shown on the page.",
        )}`,
      );
    }

    redirect("/coach");
  }

  const values = coachLoginSchema.parse(rawValues);
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    const usedDemoEmail =
      values.email.toLowerCase() === demoCoachCredentials.email.toLowerCase();
    const errorMessage = usedDemoEmail
      ? "Create a Supabase Auth user for this coach email and sign in with that password. The demo password only works when live Supabase mode is off."
      : error.message;

    redirect(`/coach/login?error=${encodeURIComponent(errorMessage)}`);
  }

  redirect("/coach");
}

export async function logoutAction() {
  if (isLiveAppEnabled) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}

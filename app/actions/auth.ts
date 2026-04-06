"use server";

import { redirect } from "next/navigation";

import { demoCoachCredentials } from "@/lib/demo/credentials";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseAuthEnabled } from "@/lib/supabase/config";
import { coachLoginSchema } from "@/lib/validation/forms";

export async function loginCoachAction(formData: FormData) {
  const rawValues = Object.fromEntries(formData.entries());

  if (!isSupabaseAuthEnabled) {
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
    redirect(`/coach/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/coach");
}

export async function logoutAction() {
  if (isSupabaseAuthEnabled) {
    const supabase = await createServerSupabaseClient();
    await supabase.auth.signOut();
  }

  redirect("/");
}

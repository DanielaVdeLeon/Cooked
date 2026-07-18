"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  firstError,
  loginSchema,
  resetRequestSchema,
  safeNext,
  signupSchema,
  updatePasswordSchema,
} from "@/lib/validation";

export type AuthActionState = {
  ok?: boolean;
  next?: string;
  message?: string;
  error?: string;
};

function siteOrigin(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstError(parsed) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return { error: "Confirm your email first — check your inbox for the link." };
    }
    return { error: "Incorrect email or password." };
  }

  revalidatePath("/", "layout");
  return { ok: true, next: safeNext(formData.get("next")) };
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signupSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: firstError(parsed) };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { display_name: parsed.data.displayName },
      emailRedirectTo: `${siteOrigin()}/auth/confirm`,
    },
  });
  if (error) {
    return { error: "Could not create the account. Please try again." };
  }

  // Also returned when the email already exists — no account enumeration.
  return {
    ok: true,
    message: "Check your email — follow the confirmation link to finish signing up.",
  };
}

export async function resetRequestAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetRequestSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: firstError(parsed) };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteOrigin()}/auth/confirm?next=/update-password`,
  });

  // Always the same answer — no account enumeration.
  return {
    ok: true,
    message: "If that email has an account, a reset link is on its way.",
  };
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: firstError(parsed) };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Your reset link has expired. Request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "Could not update the password. Request a new reset link." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Password updated." };
}

export async function logoutAction(): Promise<AuthActionState> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true };
}

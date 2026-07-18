"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, createVerificationClient } from "@/lib/supabase/admin";
import { getSessionProfile } from "@/lib/auth";
import {
  accountSettingsSchema,
  deleteAccountSchema,
  firstError,
} from "@/lib/validation";

export type SettingsActionState = {
  ok?: boolean;
  message?: string;
  error?: string;
};

/** AC-ACC-001: only the authenticated owner can change their account, and
    password change / account deletion re-verify the current password
    server-side via a stateless sign-in probe. */
async function verifyCurrentPassword(email: string, password: string) {
  const probe = createVerificationClient();
  const { error } = await probe.auth.signInWithPassword({ email, password });
  return !error;
}

export async function updateAccountAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const profile = await getSessionProfile();
  if (!profile) return { error: "Log in to manage your account." };

  const parsed = accountSettingsSchema.safeParse({
    displayName: formData.get("displayName"),
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword") ?? "",
    newPassword: formData.get("newPassword") ?? "",
    confirmPassword: formData.get("confirmPassword") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed) };
  const data = parsed.data;

  const supabase = await createClient();
  const messages: string[] = [];

  if (data.displayName !== profile.displayName) {
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: data.displayName })
      .eq("id", profile.id);
    if (error) return { error: "Could not update the display name." };
    messages.push("Name updated");
  }

  if (data.newPassword !== "") {
    const verified = await verifyCurrentPassword(profile.email, data.currentPassword);
    if (!verified) return { error: "Current password is incorrect." };
    const { error } = await supabase.auth.updateUser({ password: data.newPassword });
    if (error) return { error: "Could not change the password." };
    messages.push("Password changed");
  }

  if (data.email !== profile.email.toLowerCase()) {
    const { error } = await supabase.auth.updateUser(
      { email: data.email },
      {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/confirm`,
      },
    );
    if (error) return { error: "Could not start the email change." };
    messages.push("Check both inboxes to confirm the email change");
  }

  if (messages.length === 0) return { ok: true, message: "Nothing to save." };
  revalidatePath("/", "layout");
  return { ok: true, message: messages.join(" · ") };
}

export async function deleteAccountAction(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const profile = await getSessionProfile();
  if (!profile) return { error: "Log in first." };

  const parsed = deleteAccountSchema.safeParse({
    currentPassword: formData.get("currentPassword") ?? "",
  });
  if (!parsed.success) return { error: firstError(parsed) };

  const verified = await verifyCurrentPassword(
    profile.email,
    parsed.data.currentPassword,
  );
  if (!verified) return { error: "Current password is incorrect." };

  // Recipes and notes remain (foreign keys SET NULL); favourites cascade away.
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(profile.id);
  if (error) return { error: "Could not delete the account. Please try again." };

  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true };
}

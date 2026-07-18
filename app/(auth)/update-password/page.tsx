import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { UpdatePasswordForm } from "@/components/auth/UpdatePasswordForm";
import { getSessionProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Choose a new password" };

/** Reached from the emailed recovery link (token-gated). Without the
    recovery session there is nothing to update — back to login. */
export default async function UpdatePasswordPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?error=link");

  return (
    <main>
      <AuthCard title="Choose a new password" blueTitle>
        <UpdatePasswordForm />
      </AuthCard>
    </main>
  );
}

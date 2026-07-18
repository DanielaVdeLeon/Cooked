import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSessionProfile } from "@/lib/auth";
import { safeNext } from "@/lib/validation";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);

  // Already signed in — go straight back to where they came from (AC-ACC-001).
  const profile = await getSessionProfile();
  if (profile) redirect(next);

  return (
    <main>
      <AuthCard
        title="Log in"
        withChef
        footnote="Create an account to favourite recipes. DM me for editing access. "
      >
        <LoginForm next={next} linkError={params.error === "link"} />
      </AuthCard>
    </main>
  );
}

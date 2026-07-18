import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/AuthCard";
import { SignupForm } from "@/components/auth/SignupForm";
import { getSessionProfile } from "@/lib/auth";
import { safeNext } from "@/lib/validation";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = safeNext(params.next);

  const profile = await getSessionProfile();
  if (profile) redirect(next);

  return (
    <main>
      <AuthCard
        title="Create an account"
        intro="Join Cooked to favourite recipes and manage your settings."
        footnote="Accounts can browse and favourite. Adding and editing recipes needs editor access, granted by an administrator."
      >
        <SignupForm next={next} />
      </AuthCard>
    </main>
  );
}

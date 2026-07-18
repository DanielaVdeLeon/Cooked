import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/settings/SettingsView";
import { getSessionProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

/** Only the authenticated account owner can open settings (AC-ACC-001). */
export default async function SettingsPage() {
  const profile = await getSessionProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent("/settings")}`);

  return <SettingsView displayName={profile.displayName} email={profile.email} />;
}

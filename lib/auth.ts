import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type SessionProfile = {
  id: string;
  email: string;
  displayName: string;
  initial: string;
  role: "viewer" | "editor" | "admin";
  isEditor: boolean;
};

/** The signed-in user's profile, or null. Cached per request. */
export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role ?? "viewer") as SessionProfile["role"];
  const displayName =
    profile?.display_name?.trim() || user.email?.split("@")[0] || "Cook";

  return {
    id: user.id,
    email: user.email ?? "",
    displayName,
    initial: displayName.charAt(0).toUpperCase(),
    role,
    isEditor: role === "editor" || role === "admin",
  };
});

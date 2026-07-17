import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

/** Published recipes only — drafts and deleted recipes are excluded by RLS
    and never indexed (AC-SEO-001). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { data: recipes } = await supabase
    .from("recipes")
    .select("slug, updated_at")
    .eq("status", "published");

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...(recipes ?? []).map((r) => ({
      url: `${base}/recipes/${r.slug}`,
      lastModified: new Date(r.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}

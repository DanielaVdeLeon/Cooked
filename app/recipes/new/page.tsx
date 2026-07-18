import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipes/form/RecipeForm";
import { emptyDraft } from "@/components/recipes/form/draft";
import { EditorRequired } from "@/components/recipes/form/EditorRequired";
import { getSessionProfile } from "@/lib/auth";
import { fetchTagUsage } from "@/lib/recipes";

export const metadata: Metadata = { title: "Add recipe" };
export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  const profile = await getSessionProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent("/recipes/new")}`);
  if (!profile.isEditor) return <EditorRequired />;

  const tags = await fetchTagUsage();
  return <RecipeForm mode="create" initial={emptyDraft()} allTags={tags} />;
}

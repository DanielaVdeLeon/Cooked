import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RecipeForm } from "@/components/recipes/form/RecipeForm";
import { draftKeyed, type RecipeDraft } from "@/components/recipes/form/draft";
import { EditorRequired } from "@/components/recipes/form/EditorRequired";
import { getSessionProfile } from "@/lib/auth";
import { fetchRecipeBySlug, fetchTagUsage } from "@/lib/recipes";
import type { FullRecipe } from "@/lib/library";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

function toDraft(recipe: FullRecipe): RecipeDraft {
  return {
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    sourceName: recipe.source_name,
    sourceUrl: recipe.source_url ?? "",
    prepMinutes: recipe.prep_minutes == null ? "" : String(recipe.prep_minutes),
    cookMinutes: recipe.cook_minutes == null ? "" : String(recipe.cook_minutes),
    imagePath: recipe.image_path,
    ingredients: recipe.ingredients.map((i) =>
      draftKeyed({
        quantity: i.quantity,
        unit: i.unit,
        name: i.name,
        isHeading: i.is_heading,
      }),
    ),
    instructions: recipe.instructions.map((s) =>
      draftKeyed({
        sectionHeading: s.section_heading ?? "",
        text: s.text,
        timerMinutes: s.timer_minutes == null ? "" : String(s.timer_minutes),
      }),
    ),
    tags: recipe.tags.map((t) => t.name),
  };
}

/** Edit form — same component as Add (AC-AUTH-003: the editable form is
    never rendered for logged-out or non-editor visitors). */
export default async function EditRecipePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const profile = await getSessionProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(`/recipes/${slug}/edit`)}`);
  if (!profile.isEditor) return <EditorRequired />;

  const [recipe, tags] = await Promise.all([fetchRecipeBySlug(slug), fetchTagUsage()]);
  if (!recipe) notFound();

  return (
    <RecipeForm
      mode="edit"
      recipeId={recipe.id}
      recipeSlug={recipe.slug}
      initial={toDraft(recipe)}
      allTags={tags}
    />
  );
}

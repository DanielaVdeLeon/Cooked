"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { allErrors, recipeSchema, slugify, type RecipeInput } from "@/lib/validation";

export type SaveRecipeResult =
  | { ok: true; slug: string }
  | { ok: false; errors: string[] };

export type DeleteRecipeResult = { ok: boolean; error?: string };

/** AC-SEC-001: every mutation verifies authentication AND editor permission
    server-side before touching data; RLS is the independent second lock
    because all writes use the caller's session client. */
async function requireEditor() {
  const profile = await getSessionProfile();
  if (!profile) return { profile: null, errors: ["You need to log in to do that."] };
  if (!profile.isEditor)
    return { profile: null, errors: ["Editor access is required to manage recipes."] };
  return { profile, errors: null };
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  title: string,
): Promise<string> {
  const base = slugify(title);
  const { data } = await supabase
    .from("recipes")
    .select("slug")
    .like("slug", `${base}%`);
  const taken = new Set((data ?? []).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let n = 2; n < 1000; n += 1) {
    if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
  return `${base}-${Date.now()}`;
}

function childPayloads(data: RecipeInput) {
  return {
    ingredients: data.ingredients.map((i) => ({
      quantity: i.isHeading ? "" : i.quantity,
      unit: i.isHeading ? "" : i.unit,
      name: i.name,
      is_heading: i.isHeading,
    })),
    instructions: data.instructions.map((s) => ({
      section_heading: s.sectionHeading,
      text: s.text,
      timer_minutes: s.timerMinutes,
    })),
    tags: [...new Set(data.tags.map((t) => t.toLowerCase()))],
  };
}

export async function saveRecipeAction(input: {
  mode: "create" | "edit";
  recipeId?: string;
  data: unknown;
}): Promise<SaveRecipeResult> {
  const { profile, errors } = await requireEditor();
  if (!profile) return { ok: false, errors: errors! };

  const parsed = recipeSchema.safeParse(input.data);
  if (!parsed.success) return { ok: false, errors: allErrors(parsed) };
  const data = parsed.data;

  const supabase = await createClient();
  const scalars = {
    title: data.title,
    description: data.description,
    servings: data.servings,
    source_name: data.sourceName,
    source_url: data.sourceUrl === "" ? null : data.sourceUrl,
    prep_minutes: data.prepMinutes,
    cook_minutes: data.cookMinutes,
    image_path: data.imagePath,
    last_edited_by: profile.id,
  };
  const children = childPayloads(data);

  if (input.mode === "create") {
    const slug = await uniqueSlug(supabase, data.title);
    const { data: created, error: insertError } = await supabase
      .from("recipes")
      .insert({ ...scalars, slug, status: "published", created_by: profile.id })
      .select("id, slug")
      .single();
    if (insertError || !created) {
      return { ok: false, errors: ["Could not save the recipe. Please try again."] };
    }

    const { error: childError } = await supabase.rpc("save_recipe_children", {
      p_recipe_id: created.id,
      p_ingredients: children.ingredients,
      p_instructions: children.instructions,
      p_tags: children.tags,
    });
    if (childError) {
      // A failed save must not publish incomplete content (AC-AUTH-008).
      await supabase.from("recipes").delete().eq("id", created.id);
      return { ok: false, errors: ["Could not save the recipe. Please try again."] };
    }

    revalidatePath("/");
    return { ok: true, slug: created.slug };
  }

  if (!input.recipeId) return { ok: false, errors: ["Missing recipe reference."] };

  // Slug stays stable on edit (AC-SEO-001 stable URLs).
  const { data: updated, error: updateError } = await supabase
    .from("recipes")
    .update(scalars)
    .eq("id", input.recipeId)
    .select("id, slug")
    .maybeSingle();
  if (updateError || !updated) {
    return { ok: false, errors: ["Could not save your changes. The recipe is unchanged."] };
  }

  // Single transaction inside the function: children either fully replace or
  // stay as they were (AC-AUTH-009).
  const { error: childError } = await supabase.rpc("save_recipe_children", {
    p_recipe_id: updated.id,
    p_ingredients: children.ingredients,
    p_instructions: children.instructions,
    p_tags: children.tags,
  });
  if (childError) {
    return {
      ok: false,
      errors: ["Could not save the ingredient and step changes. The previous version is intact."],
    };
  }

  revalidatePath("/");
  revalidatePath(`/recipes/${updated.slug}`);
  return { ok: true, slug: updated.slug };
}

export async function deleteRecipeAction(recipeId: string): Promise<DeleteRecipeResult> {
  const { profile } = await requireEditor();
  if (!profile) return { ok: false, error: "Editor access is required." };

  const supabase = await createClient();
  const { data: recipe } = await supabase
    .from("recipes")
    .select("image_path, slug")
    .eq("id", recipeId)
    .maybeSingle();
  if (!recipe) return { ok: false, error: "Recipe not found." };

  const { data: deleted, error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", recipeId)
    .select("id");
  if (error || !deleted || deleted.length === 0) {
    return { ok: false, error: "Could not delete the recipe." };
  }

  if (recipe.image_path) {
    // Best-effort photo cleanup; the recipe row is already gone.
    await supabase.storage.from("recipe-images").remove([recipe.image_path]);
  }

  revalidatePath("/");
  revalidatePath(`/recipes/${recipe.slug}`);
  return { ok: true };
}

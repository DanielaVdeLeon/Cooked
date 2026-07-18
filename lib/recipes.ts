import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  FullRecipe,
  LibraryCard,
  LibrarySort,
  TagUsage,
} from "@/lib/library";

const MAX_QUERY_LENGTH = 100;

export async function fetchTagUsage(): Promise<TagUsage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("tag_usage");
  if (error) throw new Error(`tag_usage failed: ${error.message}`);
  return (data ?? []) as TagUsage[];
}

/** Published-only library feed (RLS enforces the published filter for anon).
    Search matches titles, ingredient names, and tags, case-insensitive and
    partial; multiple tags are ANDed (AC-PUB-002/003). */
export async function fetchLibrary(opts: {
  q?: string;
  tagIds?: string[];
  sort?: LibrarySort;
}): Promise<LibraryCard[]> {
  const supabase = await createClient();
  const q = (opts.q ?? "").slice(0, MAX_QUERY_LENGTH).trim();
  const tagIds = opts.tagIds ?? [];

  let query = supabase.rpc("search_recipes", { q, tag_ids: tagIds });
  switch (opts.sort ?? "recent") {
    case "updated":
      query = query.order("updated_at", { ascending: false });
      break;
    case "alpha":
      query = query.order("title", { ascending: true });
      break;
    case "time":
      query = query.order("total_minutes", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const { data: recipes, error } = await query;
  if (error) throw new Error(`search_recipes failed: ${error.message}`);
  if (!recipes || recipes.length === 0) return [];

  const ids = recipes.map((r) => r.id);
  const [{ data: tagRows, error: tagErr }, { data: ingRows, error: ingErr }] =
    await Promise.all([
      supabase
        .from("recipe_tags")
        .select("recipe_id, tags ( id, name )")
        .in("recipe_id", ids),
      supabase
        .from("ingredients")
        .select("recipe_id, quantity, unit, name, position, is_heading")
        .in("recipe_id", ids)
        .order("position", { ascending: true }),
    ]);
  if (tagErr) throw new Error(`recipe_tags fetch failed: ${tagErr.message}`);
  if (ingErr) throw new Error(`ingredients fetch failed: ${ingErr.message}`);

  const tagsByRecipe = new Map<string, { id: string; name: string }[]>();
  for (const row of tagRows ?? []) {
    const tag = row.tags as unknown as { id: string; name: string } | null;
    if (!tag) continue;
    const list = tagsByRecipe.get(row.recipe_id) ?? [];
    list.push(tag);
    tagsByRecipe.set(row.recipe_id, list);
  }

  const ingredientsByRecipe = new Map<string, LibraryCard["ingredients"]>();
  for (const row of ingRows ?? []) {
    const list = ingredientsByRecipe.get(row.recipe_id) ?? [];
    list.push(row);
    ingredientsByRecipe.set(row.recipe_id, list);
  }

  return recipes.map((r) => ({
    ...r,
    tags: tagsByRecipe.get(r.id) ?? [],
    ingredients: ingredientsByRecipe.get(r.id) ?? [],
  }));
}

/** Full recipe by slug for the detail page, or null when not visible —
    unpublished recipes return null for anonymous visitors via RLS
    (AC-PUB-004). Wrapped in cache() so generateMetadata and the page share
    one fetch per request. */
export const fetchRecipeBySlug = cache(async (slug: string): Promise<FullRecipe | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("recipes")
    .select(
      `*,
       ingredients ( * ),
       instructions ( * ),
       recipe_tags ( tags ( id, name ) ),
       notes ( * )`,
    )
    .eq("slug", slug)
    .order("position", { referencedTable: "ingredients", ascending: true })
    .order("position", { referencedTable: "instructions", ascending: true })
    .order("created_at", { referencedTable: "notes", ascending: true })
    .maybeSingle();
  if (error) throw new Error(`recipe fetch failed: ${error.message}`);
  if (!data) return null;

  const authorIds = [
    ...new Set(data.notes.map((n) => n.author_id).filter((id): id is string => !!id)),
  ];
  const authorNames = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: authors } = await supabase
      .from("public_profiles")
      .select("id, display_name")
      .in("id", authorIds);
    for (const a of authors ?? []) {
      if (a.id && a.display_name) authorNames.set(a.id, a.display_name);
    }
  }

  return {
    ...data,
    tags: data.recipe_tags
      .map((rt) => rt.tags as unknown as { id: string; name: string } | null)
      .filter((t): t is { id: string; name: string } => !!t),
    notes: data.notes.map((n) => ({
      ...n,
      author_name: n.author_id ? (authorNames.get(n.author_id) ?? null) : null,
    })),
  };
});

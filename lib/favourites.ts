import { createClient } from "@/lib/supabase/server";

export type FavouriteRow = { recipe_id: string; favourited_at: string };

/** The session user's favourites (RLS returns nothing for anonymous
    visitors). Ordered most recently favourited first. */
export async function fetchMyFavourites(): Promise<FavouriteRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favourites")
    .select("recipe_id, favourited_at")
    .order("favourited_at", { ascending: false });
  if (error) throw new Error(`favourites fetch failed: ${error.message}`);
  return data ?? [];
}

/** Whether the session user has favourited one recipe (recipe page star). */
export async function isFavourited(recipeId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favourites")
    .select("recipe_id")
    .eq("recipe_id", recipeId)
    .maybeSingle();
  return !!data;
}

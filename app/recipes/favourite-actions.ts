"use server";

import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";

export type FavouriteActionResult = { ok: boolean; error?: string };

/** Favourites are per-user data: every read and write is scoped to the
    session user (AC-FAV-001, AC-SEC-001). Any authenticated user — viewer or
    editor — can favourite. Deliberately no revalidatePath: the visible list
    order is snapshotted when a sort is selected and must not reorder while
    the user stars or unstars recipes. */
export async function toggleFavouriteAction(input: {
  recipeId: string;
  favourited: boolean;
}): Promise<FavouriteActionResult> {
  const profile = await getSessionProfile();
  if (!profile) return { ok: false, error: "Log in to favourite recipes." };

  const supabase = await createClient();
  if (input.favourited) {
    const { error } = await supabase
      .from("favourites")
      .upsert(
        { user_id: profile.id, recipe_id: input.recipeId },
        { onConflict: "user_id,recipe_id", ignoreDuplicates: true },
      );
    if (error) return { ok: false, error: "Could not save the favourite." };
  } else {
    const { error } = await supabase
      .from("favourites")
      .delete()
      .eq("user_id", profile.id)
      .eq("recipe_id", input.recipeId);
    if (error) return { ok: false, error: "Could not remove the favourite." };
  }
  return { ok: true };
}

/** Removes every favourite for the session user; recipes are unaffected. */
export async function clearFavouritesAction(): Promise<
  FavouriteActionResult & { cleared?: number }
> {
  const profile = await getSessionProfile();
  if (!profile) return { ok: false, error: "Log in first." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("favourites")
    .delete()
    .eq("user_id", profile.id)
    .select("recipe_id");
  if (error) return { ok: false, error: "Could not clear favourites." };
  return { ok: true, cleared: data?.length ?? 0 };
}

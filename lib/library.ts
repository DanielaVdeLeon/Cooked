/** Shared library types/constants — safe to import from client components. */

import type { Database } from "@/lib/database.types";

export type RecipeRow = Database["public"]["Tables"]["recipes"]["Row"];
export type IngredientRow = Database["public"]["Tables"]["ingredients"]["Row"];
export type InstructionRow = Database["public"]["Tables"]["instructions"]["Row"];
export type NoteRow = Database["public"]["Tables"]["notes"]["Row"];

export type LibraryCard = RecipeRow & {
  tags: { id: string; name: string }[];
  ingredients: Pick<
    IngredientRow,
    "quantity" | "unit" | "name" | "position" | "is_heading"
  >[];
};

export type FullRecipe = RecipeRow & {
  ingredients: IngredientRow[];
  instructions: InstructionRow[];
  tags: { id: string; name: string }[];
  notes: (NoteRow & { author_name: string | null })[];
};

export type TagUsage = { id: string; name: string; usage_count: number };

export type LibrarySort = "recent" | "favs" | "updated" | "alpha" | "time";

export const LIBRARY_SORTS: { value: LibrarySort; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "updated", label: "Recently updated" },
  { value: "alpha", label: "A to Z" },
  { value: "time", label: "Shortest time" },
];

/** Sort options including “Favourites first” — authenticated users only
    (AC-FAV-001: public visitors never see favourites-first results). */
export const LIBRARY_SORTS_AUTHED: { value: LibrarySort; label: string }[] = [
  LIBRARY_SORTS[0],
  { value: "favs", label: "Favourites first" },
  ...LIBRARY_SORTS.slice(1),
];

/** “Favourites first”: favourited recipes ordered most→least recently
    favourited, then the rest in their existing (recency) order. Pure —
    the caller decides when to re-run it, which is how the order stays
    snapshotted while the user stars and unstars (AC-FAV-001). */
export function orderWithFavourites<T extends { id: string }>(
  recipes: T[],
  favouritedAt: Map<string, string>,
): T[] {
  const favs = recipes
    .filter((r) => favouritedAt.has(r.id))
    .sort((a, b) => favouritedAt.get(b.id)!.localeCompare(favouritedAt.get(a.id)!));
  const rest = recipes.filter((r) => !favouritedAt.has(r.id));
  return [...favs, ...rest];
}

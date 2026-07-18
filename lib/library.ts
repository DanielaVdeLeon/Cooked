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

export type LibrarySort = "recent" | "updated" | "alpha" | "time";

export const LIBRARY_SORTS: { value: LibrarySort; label: string }[] = [
  { value: "recent", label: "Recently added" },
  { value: "updated", label: "Recently updated" },
  { value: "alpha", label: "A to Z" },
  { value: "time", label: "Shortest time" },
];

import { describe, expect, it } from "vitest";
import { filterAndSortLibrary, type LibraryCard } from "@/lib/library";

function card(
  id: string,
  title: string,
  options: {
    created?: string;
    updated?: string;
    minutes?: number | null;
    tags?: string[];
    ingredients?: string[];
  } = {},
): LibraryCard {
  return {
    id,
    title,
    slug: title.toLowerCase().replaceAll(" ", "-"),
    created_at: options.created ?? "2026-07-01T00:00:00Z",
    updated_at: options.updated ?? options.created ?? "2026-07-01T00:00:00Z",
    total_minutes: options.minutes ?? null,
    tags: (options.tags ?? []).map((name, index) => ({ id: `${id}-tag-${index}`, name })),
    ingredients: (options.ingredients ?? []).map((name, position) => ({
      name,
      position,
      quantity: "",
      unit: "",
      is_heading: false,
    })),
    cook_minutes: null,
    created_by: null,
    description: "",
    image_path: null,
    last_edited_by: null,
    prep_minutes: null,
    servings: "",
    source_name: "",
    source_url: null,
    status: "published",
  };
}

const recipes = [
  card("a", "Tomato Pasta", {
    created: "2026-07-03T00:00:00Z",
    updated: "2026-07-04T00:00:00Z",
    minutes: 30,
    tags: ["Italian", "Quick"],
    ingredients: ["tomatoes", "spaghetti"],
  }),
  card("b", "Green Curry", {
    created: "2026-07-02T00:00:00Z",
    updated: "2026-07-06T00:00:00Z",
    minutes: 20,
    tags: ["Thai", "Quick"],
    ingredients: ["coconut milk", "basil"],
  }),
  card("c", "Apple Crumble", {
    created: "2026-07-01T00:00:00Z",
    updated: "2026-07-05T00:00:00Z",
    minutes: 50,
    tags: ["Dessert"],
    ingredients: ["apples", "oats"],
  }),
];

describe("filterAndSortLibrary", () => {
  it("matches title, ingredient, and tag searches without a server request", () => {
    expect(filterAndSortLibrary(recipes, { query: "tomato" }).map((r) => r.id)).toEqual([
      "a",
    ]);
    expect(filterAndSortLibrary(recipes, { query: "coconut" }).map((r) => r.id)).toEqual([
      "b",
    ]);
    expect(filterAndSortLibrary(recipes, { query: "dess" }).map((r) => r.id)).toEqual([
      "c",
    ]);
  });

  it("requires every selected tag", () => {
    expect(
      filterAndSortLibrary(recipes, { tags: ["quick", "italian"] }).map((r) => r.id),
    ).toEqual(["a"]);
  });

  it("supports all library sort modes", () => {
    expect(filterAndSortLibrary(recipes, { sort: "recent" }).map((r) => r.id)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(filterAndSortLibrary(recipes, { sort: "updated" }).map((r) => r.id)).toEqual([
      "b",
      "c",
      "a",
    ]);
    expect(filterAndSortLibrary(recipes, { sort: "alpha" }).map((r) => r.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
    expect(filterAndSortLibrary(recipes, { sort: "time" }).map((r) => r.id)).toEqual([
      "b",
      "a",
      "c",
    ]);
    expect(
      filterAndSortLibrary(recipes, {
        sort: "favs",
        favouritedAt: new Map([["c", "2026-07-10T00:00:00Z"]]),
      }).map((r) => r.id),
    ).toEqual(["c", "a", "b"]);
  });
});

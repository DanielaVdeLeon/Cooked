import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { RecipeCard } from "../RecipeCard";
import type { LibraryCard } from "@/lib/library";

const recipe = {
  id: "recipe-1",
  title: "Fast Pasta",
  slug: "fast-pasta",
  tags: [{ id: "tag-1", name: "Quick" }],
  ingredients: [],
  cook_minutes: 15,
  created_at: "2026-07-01T00:00:00Z",
  created_by: null,
  description: "",
  last_edited_by: null,
  prep_minutes: 5,
  source_name: "",
  source_url: null,
  status: "published",
  total_minutes: 20,
  updated_at: "2026-07-01T00:00:00Z",
  servings: "2",
  image_path: null,
} satisfies LibraryCard;

describe("RecipeCard navigation", () => {
  beforeEach(() => window.history.replaceState(null, "", "/"));
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("uses a Next link so recipe routes can prefetch", () => {
    render(<RecipeCard recipe={recipe} />);
    expect(screen.getByRole("link", { name: "Open recipe Fast Pasta" })).toHaveAttribute(
      "href",
      "/recipes/fast-pasta",
    );
  });

  it("applies a tag filter locally without opening the recipe", () => {
    render(<RecipeCard recipe={recipe} />);
    fireEvent.click(screen.getByRole("button", { name: "Filter by tag Quick" }));
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?tags=Quick");
  });

  it("gives bare serving quantities context without changing explicit yields", () => {
    const { rerender } = render(<RecipeCard recipe={recipe} />);
    expect(screen.getByText("20 min · Serves 2")).toBeInTheDocument();

    rerender(<RecipeCard recipe={{ ...recipe, servings: "Makes 24" }} />);
    expect(screen.getByText("20 min · Makes 24")).toBeInTheDocument();
  });
});

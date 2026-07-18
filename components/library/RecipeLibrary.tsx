"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { EmptyState } from "@/components/ui/EmptyState";
import { LibraryControls } from "@/components/library/LibraryControls";
import { RecipeGrid } from "@/components/library/RecipeGrid";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import {
  filterAndSortLibrary,
  LIBRARY_SORTS,
  LIBRARY_SORTS_AUTHED,
  type LibraryCard,
  type LibrarySort,
  type TagUsage,
} from "@/lib/library";
import type { FavouriteRow } from "@/lib/favourites";
import styles from "@/app/(library)/page.module.css";

export function RecipeLibrary({
  recipes,
  tags,
  favourites,
  authenticated,
}: {
  recipes: LibraryCard[];
  tags: TagUsage[];
  favourites: FavouriteRow[];
  authenticated: boolean;
}) {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").slice(0, 100);
  const selectedTagsParam = searchParams.get("tags") ?? "";
  const selectedTags = useMemo(
    () =>
      selectedTagsParam
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    [selectedTagsParam],
  );
  const requestedSort = searchParams.get("sort") ?? "recent";
  const validSorts = authenticated ? LIBRARY_SORTS_AUTHED : LIBRARY_SORTS;
  const sort: LibrarySort = validSorts.some(({ value }) => value === requestedSort)
    ? (requestedSort as LibrarySort)
    : "recent";
  const favouritedAt = useMemo(
    () => new Map(favourites.map((favourite) => [favourite.recipe_id, favourite.favourited_at])),
    [favourites],
  );
  const visibleRecipes = useMemo(
    () =>
      filterAndSortLibrary(recipes, {
        query,
        tags: selectedTags,
        sort,
        favouritedAt,
      }),
    [recipes, query, selectedTags, sort, favouritedAt],
  );
  const hasActiveSearch = query.trim().length > 0 || selectedTags.length > 0;
  const countLabel = `${visibleRecipes.length} ${
    visibleRecipes.length === 1 ? "recipe" : "recipes"
  }`;

  function clearSearchAndFilters() {
    window.history.replaceState(null, "", "/");
  }

  return (
    <>
      <div className={styles.titleRow}>
        <h1>Recipes</h1>
        <span aria-live="polite" className={styles.count}>
          {countLabel}
        </span>
      </div>

      <LibraryControls tags={tags} authenticated={authenticated} />

      {visibleRecipes.length === 0 ? (
        hasActiveSearch ? (
          <EmptyState
            illustration="/assets/vieja.svg"
            title="No recipes match"
            detail={
              query.trim()
                ? `Nothing matches “${query.trim()}”${
                    selectedTags.length > 0 ? " with those tags" : ""
                  }. Try fewer words or different tags.`
                : "Nothing carries all of those tags together. Try removing one."
            }
          >
            <button
              type="button"
              className={styles.clearEverything}
              onClick={clearSearchAndFilters}
            >
              Clear search and filters
            </button>
          </EmptyState>
        ) : (
          <EmptyState
            illustration="/assets/chef.svg"
            title="No recipes yet"
            detail="The library is empty. Recipes added by editors will appear here for everyone to browse."
          />
        )
      ) : (
        <>
          <RecipeGrid>
            {visibleRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                favourite={authenticated ? favouritedAt.has(recipe.id) : null}
              />
            ))}
          </RecipeGrid>
          <p role="status" className={styles.endNote}>
            You’ve reached the end · {countLabel}
          </p>
        </>
      )}
    </>
  );
}

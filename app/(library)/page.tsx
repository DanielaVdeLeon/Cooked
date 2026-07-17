import { Suspense } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/EmptyState";
import { LibraryControls } from "@/components/library/LibraryControls";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { fetchLibrary, fetchTagUsage } from "@/lib/recipes";
import { LIBRARY_SORTS, type LibrarySort } from "@/lib/library";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type HomeSearchParams = { q?: string; tags?: string; sort?: string };

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<HomeSearchParams>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 100);
  const sort: LibrarySort = LIBRARY_SORTS.some((s) => s.value === params.sort)
    ? (params.sort as LibrarySort)
    : "recent";

  const tagUsage = await fetchTagUsage();
  const wantedNames = (params.tags ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const tagIds = tagUsage
    .filter((t) => wantedNames.includes(t.name.toLowerCase()))
    .map((t) => t.id);

  const recipes = await fetchLibrary({ q, tagIds, sort });

  const hasActiveSearch = q.trim().length > 0 || tagIds.length > 0;
  const countLabel = `${recipes.length} ${recipes.length === 1 ? "recipe" : "recipes"}`;

  return (
    <main>
      <div className={styles.titleRow}>
        <h1>Recipes</h1>
        <span aria-live="polite" className={styles.count}>
          {countLabel}
        </span>
      </div>

      <Suspense>
        <LibraryControls tags={tagUsage} />
      </Suspense>

      {recipes.length === 0 ? (
        hasActiveSearch ? (
          <EmptyState
            illustration="/assets/vieja.svg"
            title="No recipes match"
            detail={
              q.trim()
                ? `Nothing matches “${q.trim()}”${wantedNames.length > 0 ? " with those tags" : ""}. Try fewer words or different tags.`
                : "Nothing carries all of those tags together. Try removing one."
            }
          >
            <Link href="/" className={styles.clearEverything}>
              Clear search and filters
            </Link>
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
          <div id="recipe-grid" className={styles.grid}>
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
          <p role="status" className={styles.endNote}>
            You’ve reached the end · {countLabel}
          </p>
        </>
      )}
    </main>
  );
}

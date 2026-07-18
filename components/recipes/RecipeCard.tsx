"use client";

import { useState } from "react";
import Link from "next/link";
import { RecipePhoto } from "./RecipePhoto";
import { FavouriteStar } from "./FavouriteStar";
import { formatAmount, formatMinutes, formatYield } from "@/lib/format";
import type { LibraryCard } from "@/lib/library";
import styles from "./RecipeCard.module.css";

/** Blue construction-paper card. An inset Next link makes the whole card a
    prefetchable, keyboard-operable target; tag chips and the favourite star
    sit above it. `favourite` is null for public visitors — no star at all. */
export function RecipeCard({
  recipe,
  favourite = null,
}: {
  recipe: LibraryCard;
  favourite?: boolean | null;
}) {
  const href = `/recipes/${recipe.slug}`;
  const [prefetchFullRecipe, setPrefetchFullRecipe] = useState(false);

  const timeLabel = [
    `${formatMinutes(recipe.total_minutes)}`,
    formatYield(recipe.servings) || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article className={styles.card}>
      <Link
        href={href}
        aria-label={`Open recipe ${recipe.title}`}
        className={styles.cardLink}
        prefetch={prefetchFullRecipe ? true : null}
        onMouseEnter={() => setPrefetchFullRecipe(true)}
        onFocus={() => setPrefetchFullRecipe(true)}
        onTouchStart={() => setPrefetchFullRecipe(true)}
      />
      <div className={styles.polaroid}>
        <RecipePhoto imagePath={recipe.image_path} alt="" ratio="card" />
      </div>
      {favourite !== null ? (
        <div className={styles.starWrap}>
          <FavouriteStar
            recipeId={recipe.id}
            recipeTitle={recipe.title}
            initialFavourited={favourite}
            size="card"
          />
        </div>
      ) : null}
      <div className={styles.body}>
        <h2 className={styles.title}>{recipe.title}</h2>
        <p className={styles.meta}>{timeLabel}</p>
        {recipe.tags.length > 0 ? (
          <div className={styles.tags}>
            {recipe.tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                className={styles.chip}
                aria-label={`Filter by tag ${tag.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  window.history.pushState(
                    null,
                    "",
                    `/?tags=${encodeURIComponent(tag.name)}`,
                  );
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        ) : null}
        <div className={styles.ingredients}>
          <p className={styles.eyebrow}>Ingredients</p>
          <div className={styles.ingredientGrid}>
            {recipe.ingredients.map((ing, i) =>
              ing.is_heading ? (
                <span key={i} className={styles.ingredientHeading}>
                  {ing.name}
                </span>
              ) : (
                <div key={i} className={styles.ingredientRow}>
                  <span className={styles.amount}>
                    {formatAmount(ing.quantity, ing.unit)}
                  </span>
                  <span>{ing.name}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { RecipePhoto } from "./RecipePhoto";
import { formatAmount, formatMinutes } from "@/lib/format";
import type { LibraryCard } from "@/lib/library";
import styles from "./RecipeCard.module.css";

/** Blue construction-paper card. The whole card is the tap target
    (role=link, keyboard-operable); tag chips stop propagation and filter. */
export function RecipeCard({ recipe }: { recipe: LibraryCard }) {
  const router = useRouter();
  const href = `/recipes/${recipe.slug}`;

  function open() {
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  }

  const timeLabel = [
    `${formatMinutes(recipe.total_minutes)}`,
    recipe.servings || null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      className={styles.card}
      role="link"
      tabIndex={0}
      aria-label={`Open recipe ${recipe.title}`}
      onClick={open}
      onKeyDown={onKeyDown}
    >
      <div className={styles.polaroid}>
        <RecipePhoto imagePath={recipe.image_path} alt="" ratio="card" />
      </div>
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
                  router.push(`/?tags=${encodeURIComponent(tag.name)}`);
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
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className={styles.ingredientRow}>
                <span className={styles.amount}>
                  {formatAmount(ing.quantity, ing.unit)}
                </span>
                <span>{ing.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

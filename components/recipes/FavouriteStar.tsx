"use client";

import { useState } from "react";
import { toggleFavouriteAction } from "@/app/recipes/favourite-actions";
import { useFavouritesCount } from "@/components/library/FavouritesContext";
import { useToast } from "@/components/ui/Toast";
import styles from "./FavouriteStar.module.css";

type FavouriteStarProps = {
  recipeId: string;
  recipeTitle: string;
  initialFavourited: boolean;
  /** 44px on cards, 48px beside the recipe title. */
  size?: "card" | "page";
};

/** Favourite star: muted on a white round chip; favouriting pops it onto a
    yellow paper chip with the 0.4s spin-in. Optimistic — the visible list
    order never changes on toggle (AC-FAV-001 snapshot rule). Rendered only
    for authenticated users. */
export function FavouriteStar({
  recipeId,
  recipeTitle,
  initialFavourited,
  size = "card",
}: FavouriteStarProps) {
  const [favourited, setFavourited] = useState(initialFavourited);
  const { showToast } = useToast();
  const favCount = useFavouritesCount();

  // Re-sync with the server after a refresh (e.g. “Clear favourites”) —
  // state adjusted during render, not in an effect. Optimistic toggles are
  // unaffected because toggling never triggers a refresh.
  const [prevInitial, setPrevInitial] = useState(initialFavourited);
  if (initialFavourited !== prevInitial) {
    setPrevInitial(initialFavourited);
    setFavourited(initialFavourited);
  }

  async function onToggle(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    const next = !favourited;
    setFavourited(next);
    favCount?.adjust(next ? 1 : -1);

    const result = await toggleFavouriteAction({ recipeId, favourited: next });
    if (!result.ok) {
      setFavourited(!next);
      favCount?.adjust(next ? -1 : 1);
      showToast(result.error ?? "Could not update favourites", "danger");
      return;
    }
    showToast(
      next ? "Added to favourites" : "Removed from favourites",
      next ? "success" : "neutral",
    );
  }

  return (
    <button
      type="button"
      aria-label={
        favourited
          ? `Remove ${recipeTitle} from favourites`
          : `Add ${recipeTitle} to favourites`
      }
      aria-pressed={favourited}
      onClick={onToggle}
      className={`${styles.star} ${size === "page" ? styles.page : styles.card} ${
        favourited ? styles.favourited : styles.muted
      }`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- static brand star */}
      <img src="/assets/star.svg" alt="" className={styles.icon} />
    </button>
  );
}

"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./RecipeGrid.module.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 700px)").matches;

/** Desktop deck-shuffle re-deal: when the search/filter/sort query changes,
    cards deal back out from the top-left pile with alternating tilts and a
    40ms stagger (460ms, WAAPI). Mobile keeps the scroll-driven fade from the
    grid CSS; reduced-motion skips the animation entirely. */
export function RecipeGrid({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);
  // Skip the very first render; only re-deal on subsequent query changes.
  const queryKey = searchParams.toString();
  const previousKey = useRef<string | null>(null);

  useEffect(() => {
    const first = previousKey.current === null;
    const changed = previousKey.current !== queryKey;
    previousKey.current = queryKey;
    if (first || !changed) return;
    if (!gridRef.current || prefersReducedMotion() || !isDesktop()) return;

    const cards = Array.from(gridRef.current.children) as HTMLElement[];
    cards.forEach((card, i) => {
      const tilt = i % 2 === 0 ? -2.5 : 2.5;
      card.animate(
        [
          { opacity: 0, transform: `translate(-24px, -16px) rotate(${tilt}deg) scale(0.94)` },
          { opacity: 1, transform: "translate(0, 0) rotate(0deg) scale(1)" },
        ],
        {
          duration: 460,
          delay: i * 40,
          easing: "cubic-bezier(0.2, 0.7, 0.3, 1)",
          fill: "both",
        },
      );
    });
  }, [queryKey]);

  return (
    <div id="recipe-grid" ref={gridRef} className={styles.grid}>
      {children}
    </div>
  );
}

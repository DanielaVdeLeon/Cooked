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

    const frame = window.requestAnimationFrame(() => {
      const cards = Array.from(gridRef.current?.children ?? []) as HTMLElement[];
      if (!cards.length || typeof cards[0].animate !== "function") return;

      const pile = cards[0].getBoundingClientRect();
      cards.forEach((card, i) => {
        const position = card.getBoundingClientRect();
        const dx = pile.left - position.left;
        const dy = pile.top - position.top;
        const tilt = (i % 3 - 1) * 2.5;

        card.animate(
          [
            {
              transform: `translate(${dx}px, ${dy}px) rotate(${tilt}deg) scale(0.98)`,
              boxShadow: "0 2px 3px rgba(0, 0, 0, 0.3)",
            },
            {
              transform: "translate(0, 0) rotate(0deg) scale(1)",
              boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
            },
          ],
          {
            duration: 460,
            delay: Math.min(i * 40, 420),
            easing: "cubic-bezier(0.25, 0.8, 0.3, 1)",
            fill: "backwards",
          },
        );
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [queryKey]);

  return (
    <div id="recipe-grid" ref={gridRef} className={styles.grid}>
      {children}
    </div>
  );
}

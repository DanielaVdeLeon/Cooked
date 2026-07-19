"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./RecipeGrid.module.css";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isDesktop = () =>
  typeof window !== "undefined" && window.matchMedia("(min-width: 700px)").matches;

const gridItems = (grid: HTMLDivElement | null) =>
  Array.from(grid?.children ?? []).filter(
    (element): element is HTMLElement => element instanceof HTMLElement,
  );

const enterCards = (cards: HTMLElement[]) =>
  cards.map((card, index) =>
    card.animate(
      [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 500,
        delay: index * 110,
        easing: "cubic-bezier(0, 0, 0.2, 1)",
        fill: "backwards",
      },
    ),
  );

const exitCards = (cards: HTMLElement[]) =>
  cards.map((card, index) =>
    card.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(14px)" },
      ],
      {
        duration: 320,
        delay: Math.min(index * 45, 225),
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards",
      },
    ),
  );

const waitFor = (animations: Animation[]) =>
  Promise.all(animations.map((animation) => animation.finished.catch(() => undefined)));

const cancelAnimations = (animations: { current: Animation[] }) => {
  animations.current.forEach((animation) => animation.cancel());
  animations.current = [];
};

type DisplayedGrid = {
  children: ReactNode;
  empty: boolean;
  queryKey: string;
};

/** Desktop library motion keeps cards in their grid slots: the current result
    set fades down and out, then the replacement set fades up with a stagger.
    The component holds the previous children until their exit completes so no
    card can jump to an intermediate position. Mobile retains its scroll fade. */
export function RecipeGrid({
  children,
  empty = false,
}: {
  children: ReactNode;
  empty?: boolean;
}) {
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const gridRef = useRef<HTMLDivElement>(null);
  const runningAnimations = useRef<Animation[]>([]);
  const transitionVersion = useRef(0);
  const transitionPending = useRef(false);
  const pendingEnter = useRef(false);
  const initialEntranceStarted = useRef(false);
  const previousQueryKey = useRef(queryKey);
  const nextGrid = useRef<DisplayedGrid>({ children, empty, queryKey });

  const [displayedGrid, setDisplayedGrid] = useState<DisplayedGrid>(() => ({
    children,
    empty,
    queryKey,
  }));

  useEffect(() => {
    nextGrid.current = { children, empty, queryKey };
  }, [children, empty, queryKey]);

  useLayoutEffect(() => {
    if (initialEntranceStarted.current) return;
    initialEntranceStarted.current = true;
    if (!gridRef.current || prefersReducedMotion() || !isDesktop()) return;

    const cards = gridItems(gridRef.current);
    if (!cards.length || typeof cards[0].animate !== "function") return;
    runningAnimations.current = enterCards(cards);
  }, []);

  useEffect(() => {
    if (previousQueryKey.current === queryKey) return;
    previousQueryKey.current = queryKey;
    transitionPending.current = true;
    pendingEnter.current = false;
    const version = ++transitionVersion.current;
    cancelAnimations(runningAnimations);

    const cards = gridItems(gridRef.current);
    if (
      !gridRef.current ||
      prefersReducedMotion() ||
      !isDesktop() ||
      !cards.length ||
      typeof cards[0].animate !== "function"
    ) {
      transitionPending.current = false;
      setDisplayedGrid(nextGrid.current);
      return;
    }

    const exits = exitCards(cards);
    runningAnimations.current = exits;

    void waitFor(exits).then(() => {
      if (version !== transitionVersion.current) return;
      pendingEnter.current = true;
      transitionPending.current = false;
      setDisplayedGrid(nextGrid.current);
    });

    return () => {
      transitionVersion.current += 1;
      cancelAnimations(runningAnimations);
    };
  }, [queryKey]);

  useLayoutEffect(() => {
    if (!pendingEnter.current || displayedGrid.queryKey !== queryKey) return;
    pendingEnter.current = false;
    if (!gridRef.current || prefersReducedMotion() || !isDesktop()) return;

    cancelAnimations(runningAnimations);
    const cards = gridItems(gridRef.current);
    if (!cards.length || typeof cards[0].animate !== "function") return;
    runningAnimations.current = enterCards(cards);
  }, [displayedGrid, queryKey]);

  useEffect(() => {
    if (transitionPending.current || displayedGrid.queryKey !== queryKey) return;
    setDisplayedGrid((current) => {
      if (current.children === children && current.empty === empty) return current;
      return { children, empty, queryKey };
    });
  }, [children, displayedGrid.queryKey, empty, queryKey]);

  useEffect(
    () => () => {
      transitionVersion.current += 1;
      cancelAnimations(runningAnimations);
    },
    [],
  );

  return (
    <div
      id="recipe-grid"
      ref={gridRef}
      className={styles.grid}
      data-empty={displayedGrid.empty ? "true" : undefined}
    >
      {displayedGrid.children}
    </div>
  );
}

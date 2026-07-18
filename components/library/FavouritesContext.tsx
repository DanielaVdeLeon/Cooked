"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type FavouritesContextValue = {
  count: number;
  adjust: (delta: number) => void;
  reset: () => void;
};

const FavouritesContext = createContext<FavouritesContextValue | null>(null);

/** Tracks the user's favourite count on the library page so the
    “Clear favourites” confirmation can state the exact number affected,
    even after in-page starring. */
export function FavouritesProvider({
  initialCount,
  children,
}: {
  initialCount: number;
  children: ReactNode;
}) {
  const [count, setCount] = useState(initialCount);
  return (
    <FavouritesContext.Provider
      value={{
        count,
        adjust: (delta) => setCount((c) => Math.max(0, c + delta)),
        reset: () => setCount(0),
      }}
    >
      {children}
    </FavouritesContext.Provider>
  );
}

/** Null outside the provider (e.g. the recipe page star). */
export function useFavouritesCount(): FavouritesContextValue | null {
  return useContext(FavouritesContext);
}

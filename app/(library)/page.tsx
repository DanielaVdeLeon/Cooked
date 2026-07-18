import { Suspense } from "react";
import { FavouritesProvider } from "@/components/library/FavouritesContext";
import { RecipeLibrary } from "@/components/library/RecipeLibrary";
import { fetchLibrary, fetchTagUsage } from "@/lib/recipes";
import { fetchMyFavourites } from "@/lib/favourites";
import { getSessionProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const profilePromise = getSessionProfile();
  const favouritesPromise = profilePromise.then((profile) =>
    profile ? fetchMyFavourites() : [],
  );
  const [profile, favourites, tagUsage, recipes] = await Promise.all([
    profilePromise,
    favouritesPromise,
    fetchTagUsage(),
    fetchLibrary({ sort: "recent" }),
  ]);

  return (
    <main>
      <FavouritesProvider initialCount={favourites.length}>
        <Suspense>
          <RecipeLibrary
            recipes={recipes}
            tags={tagUsage}
            favourites={favourites}
            authenticated={!!profile}
          />
        </Suspense>
      </FavouritesProvider>
    </main>
  );
}

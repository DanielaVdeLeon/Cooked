import styles from "./RecipePhoto.module.css";

type RecipePhotoProps = {
  imagePath: string | null;
  alt: string;
  /** 4/3 on cards, 16/9 on the recipe page. */
  ratio?: "card" | "hero";
};

function publicImageUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/recipe-images/${path}`;
}

/** Scanned-print photo treatment per the asset rules; the missing-image
    state shows the cookware line illustration. */
export function RecipePhoto({ imagePath, alt, ratio = "card" }: RecipePhotoProps) {
  return (
    <div className={`${styles.frame} ${ratio === "hero" ? styles.hero : styles.card}`}>
      {imagePath ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- Supabase-hosted photo with CSS filter treatment */}
          <img
            src={publicImageUrl(imagePath)}
            alt={alt}
            className={styles.photo}
            loading={ratio === "card" ? "lazy" : "eager"}
            decoding="async"
            fetchPriority={ratio === "hero" ? "high" : "auto"}
          />
          <div aria-hidden="true" className={styles.grunge} />
        </>
      ) : (
        <div className={styles.missing}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static illustration */}
          <img src="/assets/cookware.svg" alt="" aria-hidden="true" className={styles.cookware} />
          <span className={styles.missingLabel}>No photo yet</span>
        </div>
      )}
    </div>
  );
}

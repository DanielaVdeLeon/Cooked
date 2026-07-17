import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchRecipeBySlug } from "@/lib/recipes";
import { RecipePhoto } from "@/components/recipes/RecipePhoto";
import { formatAmount, formatDate, formatMinutes } from "@/lib/format";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

type Params = { slug: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const recipe = await fetchRecipeBySlug(slug);
  // Resolves before streaming starts, so unknown slugs get a real 404 status.
  if (!recipe) notFound();
  return {
    title: recipe.title,
    description: recipe.description || `${recipe.title} — a recipe on Cooked.`,
    alternates: { canonical: `/recipes/${recipe.slug}` },
    openGraph: {
      title: recipe.title,
      description: recipe.description || undefined,
      type: "article",
      url: `/recipes/${recipe.slug}`,
    },
  };
}

const NOTE_TONES = [styles.noteYellow, styles.noteBlue, styles.noteOrange];

export default async function RecipePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const recipe = await fetchRecipeBySlug(slug);
  if (!recipe) notFound();

  const numberedSteps = recipe.instructions.map((step, i) => ({
    step,
    number: i + 1,
  }));

  return (
    <main className={styles.page}>
      <div className={styles.headBlock}>
        <div className={styles.titleStrip}>
          <h1 className={styles.title}>{recipe.title}</h1>
        </div>
      </div>

      {recipe.description ? (
        <p className={styles.description}>{recipe.description}</p>
      ) : null}

      {recipe.tags.length > 0 ? (
        <div className={styles.tags}>
          {recipe.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/?tags=${encodeURIComponent(tag.name)}`}
              aria-label={`Show recipes tagged ${tag.name}`}
              className={styles.chip}
            >
              {tag.name}
            </Link>
          ))}
        </div>
      ) : null}

      <div className={styles.photoFrame}>
        <RecipePhoto imagePath={recipe.image_path} alt={recipe.title} ratio="hero" />
      </div>

      <div className={styles.metaStrip}>
        <div>
          <span className={styles.metaLabel}>Prep</span>
          {formatMinutes(recipe.prep_minutes)}
        </div>
        <div>
          <span className={styles.metaLabel}>Cook</span>
          {formatMinutes(recipe.cook_minutes)}
        </div>
        <div>
          <span className={styles.metaLabel}>Total</span>
          {formatMinutes(recipe.total_minutes)}
        </div>
        {recipe.servings ? (
          <div>
            <span className={styles.metaLabel}>Serves</span>
            {recipe.servings}
          </div>
        ) : null}
        {recipe.source_name || recipe.source_url ? (
          <div>
            <span className={styles.metaLabel}>Source</span>
            {recipe.source_url ? (
              <a href={recipe.source_url} target="_blank" rel="noreferrer">
                {recipe.source_name || "Original recipe"}
              </a>
            ) : (
              recipe.source_name
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.columns}>
        <section aria-label="Ingredients" className={styles.ingredients}>
          <h2 className={styles.sectionTitle}>Ingredients</h2>
          <div className={styles.ingredientGrid}>
            {recipe.ingredients.map((ing) => (
              <div key={ing.id} className={styles.ingredientRow}>
                <span className={styles.amount}>
                  {formatAmount(ing.quantity, ing.unit)}
                </span>
                <span>{ing.name}</span>
              </div>
            ))}
          </div>
        </section>

        <div className={styles.rightColumn}>
          <section aria-label="Method" className={styles.method}>
            <h2 className={styles.sectionTitle}>Method</h2>
            <div className={styles.steps}>
              {numberedSteps.map(({ step, number }) => {
                return (
                  <div key={step.id}>
                    {step.section_heading ? (
                      <p className={styles.stepHeading}>{step.section_heading}</p>
                    ) : null}
                    <div className={styles.step}>
                      <span aria-hidden="true" className={styles.stepNumber}>
                        {number}
                      </span>
                      <div className={styles.stepBody}>
                        <p className={styles.stepText}>{step.text}</p>
                        {step.timer_minutes ? (
                          <p className={styles.stepTimer}>
                            Timer · {formatMinutes(step.timer_minutes)}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section aria-label="Notes">
            <h2 className={styles.notesTitle}>Notes</h2>
            <p className={styles.notesHint}>
              Alterations and results from past cooks, oldest first.
            </p>
            {recipe.notes.length > 0 ? (
              <div className={styles.notes}>
                {recipe.notes.map((note, i) => (
                  <div
                    key={note.id}
                    className={`${styles.note} ${NOTE_TONES[i % NOTE_TONES.length]} ${
                      i % 2 === 0 ? styles.noteTiltA : styles.noteTiltB
                    }`}
                  >
                    <p className={styles.noteText}>{note.body}</p>
                    <p className={styles.noteByline}>
                      {[
                        note.author_name,
                        formatDate(note.created_at),
                        note.updated_at > note.created_at ? "edited" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noNotes}>No notes yet.</p>
            )}
            <p className={styles.notesFooter}>
              Notes are added by Cooked editors.{" "}
              <Link href={`/login?next=${encodeURIComponent(`/recipes/${recipe.slug}`)}`}>
                Log in
              </Link>{" "}
              if you have editing access.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

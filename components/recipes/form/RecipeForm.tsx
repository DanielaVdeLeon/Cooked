"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteRecipeAction,
  saveRecipeAction,
} from "@/app/recipes/recipe-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import type { TagUsage } from "@/lib/library";
import { ImagePicker } from "./ImagePicker";
import { TagCombobox } from "./TagCombobox";
import styles from "./RecipeForm.module.css";

import {
  newIngredientRow,
  newStepRow,
  type IngredientDraft,
  type RecipeDraft,
  type StepDraft,
} from "./draft";

type RecipeFormProps = {
  mode: "create" | "edit";
  recipeId?: string;
  recipeSlug?: string;
  initial: RecipeDraft;
  allTags: TagUsage[];
};

function toNumber(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function moveItem<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  const [item] = copy.splice(index, 1);
  copy.splice(target, 0, item);
  return copy;
}

export function RecipeForm({
  mode,
  recipeId,
  recipeSlug,
  initial,
  allTags,
}: RecipeFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<RecipeDraft>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const initialJson = useMemo(() => JSON.stringify(initial), [initial]);
  const topRef = useRef<HTMLDivElement>(null);

  const dirty = JSON.stringify(draft) !== initialJson;

  // Warn before the browser discards unsaved changes (required state).
  // In-app navigation goes through onCancel's confirm dialog instead.
  useEffect(() => {
    if (!dirty) return;
    function onBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  function patch(partial: Partial<RecipeDraft>) {
    setDraft((d) => ({ ...d, ...partial }));
  }

  function patchIngredient(index: number, partial: Partial<IngredientDraft>) {
    setDraft((d) => ({
      ...d,
      ingredients: d.ingredients.map((row, i) =>
        i === index ? { ...row, ...partial } : row,
      ),
    }));
  }

  function patchStep(index: number, partial: Partial<StepDraft>) {
    setDraft((d) => ({
      ...d,
      instructions: d.instructions.map((row, i) =>
        i === index ? { ...row, ...partial } : row,
      ),
    }));
  }

  const backHref = mode === "edit" && recipeSlug ? `/recipes/${recipeSlug}` : "/";

  function leaveForm() {
    // Returning through history removes the form entry. Pushing the destination
    // here would leave the form behind it, so the next Back reopened the form.
    if (window.history.length > 2) router.back();
    else router.replace(backHref);
  }

  function onCancel() {
    if (dirty) setConfirmDiscard(true);
    else leaveForm();
  }

  async function onSave() {
    setSaving(true);
    const payload = {
      title: draft.title,
      description: draft.description,
      servings: draft.servings,
      sourceName: draft.sourceName,
      sourceUrl: draft.sourceUrl.trim(),
      prepMinutes: toNumber(draft.prepMinutes),
      cookMinutes: toNumber(draft.cookMinutes),
      imagePath: draft.imagePath,
      ingredients: draft.ingredients
        .filter((r) => r.name.trim() !== "" || r.quantity.trim() !== "" || r.unit.trim() !== "")
        .map((r) => ({
          quantity: r.quantity,
          unit: r.unit,
          name: r.name,
          isHeading: r.isHeading,
        })),
      instructions: draft.instructions
        .filter((s) => s.text.trim() !== "" || s.sectionHeading.trim() !== "")
        .map((s) => ({
          sectionHeading: s.sectionHeading,
          text: s.text,
          timerMinutes: toNumber(s.timerMinutes),
        })),
      tags: draft.tags,
    };

    const result = await saveRecipeAction({ mode, recipeId, data: payload });
    setSaving(false);

    if (!result.ok) {
      setErrors(result.errors);
      showToast("Could not save", "danger");
      topRef.current?.scrollIntoView({ block: "start" });
      return;
    }

    // Save flips to a green “✓ Saved” pop for 700ms before navigating.
    setSavedFlash(true);
    showToast("Recipe saved", "success");
    setTimeout(() => {
      router.push(`/recipes/${result.slug}`);
      router.refresh();
    }, 700);
  }

  async function onDelete() {
    setConfirmDelete(false);
    if (!recipeId) return;
    const result = await deleteRecipeAction(recipeId);
    if (!result.ok) {
      setErrors([result.error ?? "Could not delete the recipe."]);
      topRef.current?.scrollIntoView({ block: "start" });
      return;
    }
    showToast("Recipe deleted", "danger");
    router.push("/");
    router.refresh();
  }

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <p className={styles.heading}>
            {mode === "create" ? "Add recipe" : "Edit recipe"}
          </p>
          <button
            type="button"
            className={`${styles.save} ${savedFlash ? styles.saved : ""}`}
            onClick={onSave}
            disabled={saving || savedFlash}
          >
            {savedFlash ? "✓ Saved" : saving ? "Saving…" : "Save"}
          </button>
        </div>
      </header>

      <div className={styles.body} ref={topRef}>
        {errors.length > 0 ? (
          <div role="alert" className={styles.errorSummary}>
            <p className={styles.errorTitle}>Fix the following to save:</p>
            <ul className={styles.errorList}>
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Basics</h2>
          <label htmlFor="f-title" className={styles.label}>
            Title <span className={styles.required}>*</span>
          </label>
          <input
            id="f-title"
            value={draft.title}
            maxLength={120}
            onChange={(e) => patch({ title: e.target.value })}
            className={styles.input}
          />
          <label htmlFor="f-desc" className={styles.label}>
            Description
          </label>
          <textarea
            id="f-desc"
            value={draft.description}
            maxLength={2000}
            rows={3}
            onChange={(e) => patch({ description: e.target.value })}
            className={styles.textarea}
          />
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Image &amp; source</h2>
          <ImagePicker
            imagePath={draft.imagePath}
            onChange={(imagePath) => patch({ imagePath })}
          />
          <label htmlFor="f-srcname" className={styles.label}>
            Source name
          </label>
          <input
            id="f-srcname"
            value={draft.sourceName}
            maxLength={120}
            placeholder="e.g. Hello Fresh"
            onChange={(e) => patch({ sourceName: e.target.value })}
            className={styles.input}
          />
          <label htmlFor="f-srcurl" className={styles.label}>
            Source URL
          </label>
          <input
            id="f-srcurl"
            value={draft.sourceUrl}
            maxLength={500}
            placeholder="https://"
            inputMode="url"
            onChange={(e) => patch({ sourceUrl: e.target.value })}
            className={`${styles.input} ${styles.lastInput}`}
          />
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Timing &amp; servings</h2>
          <div className={styles.timingGrid}>
            <div>
              <label htmlFor="f-prep" className={styles.label}>
                Prep (min)
              </label>
              <input
                id="f-prep"
                type="number"
                min={0}
                max={6000}
                value={draft.prepMinutes}
                onChange={(e) => patch({ prepMinutes: e.target.value })}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="f-cook" className={styles.label}>
                Cook (min)
              </label>
              <input
                id="f-cook"
                type="number"
                min={0}
                max={6000}
                value={draft.cookMinutes}
                onChange={(e) => patch({ cookMinutes: e.target.value })}
                className={styles.input}
              />
            </div>
            <div>
              <label htmlFor="f-serv" className={styles.label}>
                Serves
              </label>
              <input
                id="f-serv"
                value={draft.servings}
                maxLength={40}
                placeholder="4, or ‘Makes 24’"
                onChange={(e) => patch({ servings: e.target.value })}
                className={styles.input}
              />
            </div>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>
            Ingredients <span className={styles.required}>*</span>
          </h2>
          <div className={styles.rows}>
            {draft.ingredients.map((row, i) => (
              <div key={row.key}>
                {row.isHeading ? (
                  <div className={styles.headingRow}>
                    <input
                      value={row.name}
                      maxLength={120}
                      aria-label="Section heading"
                      placeholder="Section heading"
                      onChange={(e) => patchIngredient(i, { name: e.target.value })}
                      className={styles.headingInput}
                    />
                    <button
                      type="button"
                      aria-label="Remove section heading"
                      className={styles.removeButton}
                      onClick={() =>
                        patch({ ingredients: draft.ingredients.filter((_, x) => x !== i) })
                      }
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className={styles.ingredientRow}>
                    <input
                      value={row.quantity}
                      maxLength={40}
                      aria-label="Quantity"
                      placeholder="2"
                      onChange={(e) => patchIngredient(i, { quantity: e.target.value })}
                      className={styles.quantityInput}
                    />
                    <input
                      value={row.unit}
                      maxLength={40}
                      aria-label="Unit"
                      placeholder="tbsp"
                      onChange={(e) => patchIngredient(i, { unit: e.target.value })}
                      className={styles.unitInput}
                    />
                    <input
                      value={row.name}
                      maxLength={120}
                      aria-label="Ingredient name"
                      placeholder="olive oil"
                      onChange={(e) => patchIngredient(i, { name: e.target.value })}
                      className={styles.nameInput}
                    />
                    <div className={styles.rowButtons}>
                      <button
                        type="button"
                        aria-label="Move ingredient up"
                        className={styles.moveButton}
                        onClick={() =>
                          patch({ ingredients: moveItem(draft.ingredients, i, -1) })
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="Move ingredient down"
                        className={styles.moveButton}
                        onClick={() =>
                          patch({ ingredients: moveItem(draft.ingredients, i, 1) })
                        }
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        aria-label="Remove ingredient"
                        className={styles.removeButton}
                        onClick={() =>
                          patch({ ingredients: draft.ingredients.filter((_, x) => x !== i) })
                        }
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={styles.addRow}>
            <button
              type="button"
              className={styles.addPrimary}
              onClick={() =>
                patch({
                  ingredients: [
                    ...draft.ingredients,
                    newIngredientRow(),
                  ],
                })
              }
            >
              + Ingredient
            </button>
            <button
              type="button"
              className={styles.addSecondary}
              onClick={() =>
                patch({
                  ingredients: [
                    ...draft.ingredients,
                    newIngredientRow(true),
                  ],
                })
              }
            >
              + Section heading
            </button>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Instructions</h2>
          <div className={styles.stepRows}>
            {draft.instructions.map((step, i) => (
              <div key={step.key} className={styles.stepCard}>
                <div className={styles.stepTop}>
                  <span aria-hidden="true" className={styles.stepNumber}>
                    {i + 1}
                  </span>
                  <input
                    value={step.sectionHeading}
                    maxLength={120}
                    aria-label="Section heading (optional)"
                    placeholder="Section heading (optional)"
                    onChange={(e) => patchStep(i, { sectionHeading: e.target.value })}
                    className={styles.stepHeadingInput}
                  />
                  <input
                    value={step.timerMinutes}
                    type="number"
                    min={0}
                    max={6000}
                    aria-label="Timer minutes (optional)"
                    placeholder="min"
                    onChange={(e) => patchStep(i, { timerMinutes: e.target.value })}
                    className={styles.timerInput}
                  />
                </div>
                <textarea
                  value={step.text}
                  maxLength={2000}
                  rows={2}
                  aria-label="Step text"
                  placeholder="Describe this step"
                  onChange={(e) => patchStep(i, { text: e.target.value })}
                  className={styles.stepTextarea}
                />
                <div className={styles.stepButtons}>
                  <button
                    type="button"
                    aria-label="Move step up"
                    className={styles.moveButton}
                    onClick={() => patch({ instructions: moveItem(draft.instructions, i, -1) })}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move step down"
                    className={styles.moveButton}
                    onClick={() => patch({ instructions: moveItem(draft.instructions, i, 1) })}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    aria-label="Remove step"
                    className={styles.removeButton}
                    onClick={() =>
                      patch({ instructions: draft.instructions.filter((_, x) => x !== i) })
                    }
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.addPrimary}
            onClick={() =>
              patch({
                instructions: [
                  ...draft.instructions,
                  newStepRow(),
                ],
              })
            }
          >
            + Step
          </button>
        </section>

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Tags</h2>
          <TagCombobox
            allTags={allTags}
            selected={draft.tags}
            onChange={(tags) => patch({ tags })}
          />
        </section>

        {mode === "edit" ? (
          <section className={`${styles.card} ${styles.dangerCard}`}>
            <h2 className={`${styles.cardTitle} ${styles.dangerTitle}`}>Danger zone</h2>
            <button
              type="button"
              className={styles.deleteButton}
              onClick={() => setConfirmDelete(true)}
            >
              Delete recipe
            </button>
          </section>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard changes?"
        message="Your unsaved edits will be lost."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        danger
        onConfirm={() => {
          setConfirmDiscard(false);
          leaveForm();
        }}
        onCancel={() => setConfirmDiscard(false)}
      />
      <ConfirmDialog
        open={confirmDelete}
        title="Delete recipe?"
        message={`Delete “${draft.title || "this recipe"}” permanently? This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

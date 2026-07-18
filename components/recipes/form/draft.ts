/** Draft state types + constructors for the recipe form. No "use client" —
    server pages build initial drafts, the client form mutates them. */

let draftKey = 0;
const nextKey = () => `row-${draftKey++}`;

export type IngredientDraft = {
  key: string;
  quantity: string;
  unit: string;
  name: string;
  isHeading: boolean;
};

export type StepDraft = {
  key: string;
  sectionHeading: string;
  text: string;
  timerMinutes: string;
};

export type RecipeDraft = {
  title: string;
  description: string;
  servings: string;
  sourceName: string;
  sourceUrl: string;
  prepMinutes: string;
  cookMinutes: string;
  imagePath: string | null;
  ingredients: IngredientDraft[];
  instructions: StepDraft[];
  tags: string[];
};

export function newIngredientRow(isHeading = false): IngredientDraft {
  return { key: nextKey(), quantity: "", unit: "", name: "", isHeading };
}

export function newStepRow(): StepDraft {
  return { key: nextKey(), sectionHeading: "", text: "", timerMinutes: "" };
}

export function emptyDraft(): RecipeDraft {
  return {
    title: "",
    description: "",
    servings: "",
    sourceName: "",
    sourceUrl: "",
    prepMinutes: "",
    cookMinutes: "",
    imagePath: null,
    ingredients: [newIngredientRow()],
    instructions: [newStepRow()],
    tags: [],
  };
}

export function draftKeyed<T extends object>(row: T): T & { key: string } {
  return { ...row, key: nextKey() };
}

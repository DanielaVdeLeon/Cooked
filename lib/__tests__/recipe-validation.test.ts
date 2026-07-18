import { describe, expect, it } from "vitest";
import { allErrors, recipeSchema, slugify } from "../validation";

const validRecipe = {
  title: "Cacio e Pepe",
  description: "",
  servings: "2",
  sourceName: "",
  sourceUrl: "",
  prepMinutes: 5,
  cookMinutes: 15,
  imagePath: null,
  ingredients: [
    { quantity: "200", unit: "g", name: "spaghetti", isHeading: false },
  ],
  instructions: [
    { sectionHeading: "", text: "Cook the pasta.", timerMinutes: 9 },
  ],
  tags: ["pasta"],
};

describe("recipeSchema (AC-AUTH-008 validation, title/ingredient rules)", () => {
  it("accepts a valid recipe", () => {
    expect(recipeSchema.safeParse(validRecipe).success).toBe(true);
  });

  it("requires an unambiguous recipe yield", () => {
    expect(
      recipeSchema.safeParse({ ...validRecipe, servings: "Makes 24" }).success,
    ).toBe(true);
    const result = recipeSchema.safeParse({ ...validRecipe, servings: "a lot" });

    expect(result.success).toBe(false);
    expect(allErrors(result)).toContain(
      "Enter a number, or begin the yield with “Serves” or “Makes”.",
    );
  });

  it("preserves intentional line breaks inside a recipe step", () => {
    const text = [
      "a) Keep your butter in the fridge.",
      "",
      "b) Peel and grate the garlic.",
      "",
      "c) Heat a drizzle of oil in a saucepan.",
    ].join("\n");
    const result = recipeSchema.safeParse({
      ...validRecipe,
      instructions: [{ sectionHeading: "", text, timerMinutes: null }],
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.instructions[0].text).toBe(text);
  });

  it("requires a title", () => {
    const r = recipeSchema.safeParse({ ...validRecipe, title: "  " });
    expect(r.success).toBe(false);
    expect(allErrors(r)).toContain("Add a title.");
  });

  it("caps titles at 120 characters", () => {
    const r = recipeSchema.safeParse({ ...validRecipe, title: "x".repeat(121) });
    expect(r.success).toBe(false);
  });

  it("requires at least one non-heading ingredient", () => {
    const r = recipeSchema.safeParse({
      ...validRecipe,
      ingredients: [{ quantity: "", unit: "", name: "The braise", isHeading: true }],
    });
    expect(r.success).toBe(false);
    expect(allErrors(r)).toContain("Add at least one ingredient.");
  });

  it("rejects non-http(s) source URLs", () => {
    expect(
      recipeSchema.safeParse({
        ...validRecipe,
        sourceUrl: "javascript:alert(1)",
      }).success,
    ).toBe(false);
    expect(
      recipeSchema.safeParse({ ...validRecipe, sourceUrl: "https://ok.example" })
        .success,
    ).toBe(true);
    expect(recipeSchema.safeParse({ ...validRecipe, sourceUrl: "" }).success).toBe(true);
  });

  it("bounds timers and times", () => {
    expect(
      recipeSchema.safeParse({
        ...validRecipe,
        instructions: [{ sectionHeading: "", text: "Wait.", timerMinutes: 0 }],
      }).success,
    ).toBe(false);
    expect(
      recipeSchema.safeParse({ ...validRecipe, prepMinutes: 6001 }).success,
    ).toBe(false);
  });

  it("caps tag counts and lengths", () => {
    expect(
      recipeSchema.safeParse({
        ...validRecipe,
        tags: Array.from({ length: 21 }, (_, i) => `tag-${i}`),
      }).success,
    ).toBe(false);
    expect(
      recipeSchema.safeParse({ ...validRecipe, tags: ["x".repeat(41)] }).success,
    ).toBe(false);
  });
});

describe("slugify (stable public URLs, AC-SEO-001)", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Slow-Braised Beef Ragù")).toBe("slow-braised-beef-ragu");
  });
  it("collapses punctuation runs", () => {
    expect(slugify("Mac & Cheese!!!")).toBe("mac-cheese");
  });
  it("never returns an empty slug", () => {
    expect(slugify("···")).toBe("recipe");
  });
});

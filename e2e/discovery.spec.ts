import { test, expect } from "@playwright/test";

/**
 * AC-E2E-001: a visitor with no account can complete the entire discovery and
 * viewing journey — open Cooked, search an ingredient, filter, open a recipe —
 * without ever being asked to log in.
 */
test("public visitor discovery journey needs no login (AC-E2E-001)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Recipes", level: 1 })).toBeVisible();

  // Search by an ingredient present in the seed data.
  await page.getByRole("searchbox", { name: "Search recipes" }).fill("pecorino");
  await expect(page.getByRole("link", { name: /Open recipe Cacio e Pepe/ })).toBeVisible();

  // Clearing search restores the collection.
  await page.getByRole("searchbox", { name: "Search recipes" }).fill("");
  await expect(
    page.getByRole("link", { name: /Open recipe/ }).first(),
  ).toBeVisible();

  // Filter by a tag via a card chip.
  await page.getByRole("button", { name: "Filter by tag pasta" }).first().click();
  await expect(page).toHaveURL(/tags=pasta/);

  // Open a recipe and see its content; no login redirect anywhere.
  await page.getByRole("link", { name: /Open recipe/ }).first().click();
  await expect(page).toHaveURL(/\/recipes\//);
  await expect(page.getByRole("heading", { name: "Ingredients" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Method" })).toBeVisible();
  await expect(page).not.toHaveURL(/\/login/);

  // No favourite star or editor controls for the public visitor.
  await expect(page.getByRole("button", { name: /to favourites/ })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Edit recipe" })).toHaveCount(0);
});

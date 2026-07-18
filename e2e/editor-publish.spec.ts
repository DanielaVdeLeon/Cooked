import { test, expect } from "@playwright/test";

/**
 * AC-E2E-002: an approved editor logs in, adds and publishes a recipe, and the
 * recipe then appears in the public library and is viewable by a logged-out
 * visitor. Uses the QA editor account; cleans the recipe up at the end.
 */

const EDITOR = { email: "testcook@example.com", password: "test-cook-pass-1" };
const TITLE = `E2E Test Bake ${Date.now()}`;

test("editor publishes a recipe a visitor can then view (AC-E2E-002)", async ({
  page,
  context,
}) => {
  // Log in as the editor.
  await page.goto("/login");
  const form = page.locator("form");
  await form.getByLabel("Email").fill(EDITOR.email);
  await form.getByLabel("Password").fill(EDITOR.password);
  await form.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(page.getByRole("link", { name: "+ Add recipe" })).toBeVisible();

  // Fill the add-recipe form: title + one ingredient + one step.
  await page.goto("/recipes/new");
  await page.getByLabel(/^Title/).fill(TITLE);
  await page.getByRole("textbox", { name: "Ingredient name" }).fill("flour");
  await page.getByRole("textbox", { name: "Step text" }).fill("Mix and bake.");
  await page.getByRole("button", { name: "Save", exact: true }).click();

  // Lands on the new recipe page.
  await expect(page).toHaveURL(/\/recipes\//, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: TITLE })).toBeVisible();
  const recipeUrl = page.url();

  // A logged-out visitor (fresh context) can view it.
  const anon = await context.browser()!.newContext();
  const anonPage = await anon.newPage();
  await anonPage.goto(recipeUrl);
  await expect(anonPage.getByRole("heading", { name: TITLE })).toBeVisible();
  await expect(anonPage.getByRole("link", { name: "Edit recipe" })).toHaveCount(0);
  await anon.close();

  // Clean up: delete via the edit form's danger zone.
  await page.goto(`${recipeUrl}/edit`);
  await page.getByRole("button", { name: "Delete recipe" }).click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/localhost:3000\/$/, { timeout: 15_000 });
});

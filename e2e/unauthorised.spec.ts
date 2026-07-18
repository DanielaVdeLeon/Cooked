import { test, expect } from "@playwright/test";

/**
 * AC-E2E-003: a logged-out visitor cannot create, edit, or delete a recipe or
 * note — the protected pages don't expose the tools and the endpoints reject
 * the requests. (The endpoint-level rejection is also covered by the live
 * Vitest authorization suites; here we assert the UI/route behaviour.)
 */
test("logged-out visitor cannot reach editor tools (AC-E2E-003)", async ({ page }) => {
  // Add-recipe route redirects to login.
  await page.goto("/recipes/new");
  await expect(page).toHaveURL(/\/login/);

  // A public recipe page shows no edit control and no note composer.
  await page.goto("/");
  await page.getByRole("link", { name: /Open recipe/ }).first().click();
  await expect(page).toHaveURL(/\/recipes\//);
  await expect(page.getByRole("link", { name: "Edit recipe" })).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: /note/i })).toHaveCount(0);

  // The edit URL for that recipe also redirects to login.
  const slug = page.url().split("/recipes/")[1];
  await page.goto(`/recipes/${slug}/edit`);
  await expect(page).toHaveURL(/\/login/);
});

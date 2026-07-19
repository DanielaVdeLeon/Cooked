import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "components/recipes/RecipeCard.module.css"),
  "utf8",
).replace(/\s+/g, " ");

describe("RecipeCard tactile motion", () => {
  it("moves the card as one object and leaves the photo treatment flat", () => {
    expect(css).toContain(".card:hover { transform: translateY(-3px) rotate(-0.35deg);");
    expect(css).not.toContain(".card:hover .polaroid");
    expect(css).toContain(".card:has(.cardLink:active) { transform: translateY(2px) scale(0.995);");
  });

  it("underlines the title for pointer and keyboard link affordance", () => {
    expect(css).toContain(".card:hover .title");
    expect(css).toContain(".card:has(.cardLink:focus-visible) .title");
    expect(css).toContain("text-decoration: underline;");
  });
});

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "components/library/RecipeGrid.module.css"),
  "utf8",
).replace(/\s+/g, " ");

describe("RecipeGrid mobile motion", () => {
  it("defines the scroll-fade keyframes in the same CSS module that uses them", () => {
    expect(css).toContain("@keyframes cookedCardIn");
    expect(css).toContain("from { opacity: 0.55;");
    expect(css).toContain("to { opacity: 1;");
    expect(css).toContain("animation: cookedCardIn linear both;");
    expect(css).toContain("animation-timeline: view();");
    expect(css).toContain("animation-range: entry 0% entry 35%;");
  });
});

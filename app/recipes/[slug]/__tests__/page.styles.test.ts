import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "app/recipes/[slug]/page.module.css"),
  "utf8",
);

describe("recipe page step styles", () => {
  it("preserves line breaks while allowing long step text to wrap", () => {
    const declarations = css.match(/\.stepText\s*\{([^}]*)\}/)?.[1];

    expect(declarations).toContain("white-space: pre-wrap");
    expect(declarations).toContain("overflow-wrap: anywhere");
  });
});

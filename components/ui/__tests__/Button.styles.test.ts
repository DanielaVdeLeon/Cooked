import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "components/ui/Button.module.css"),
  "utf8",
).replace(/\s+/g, " ");

describe("Button tactile motion", () => {
  it("lifts physical buttons and compresses them when pressed", () => {
    expect(css).toContain(".button:not(.text):hover:not(:disabled)");
    expect(css).toContain("transform: translate(-1px, -1px);");
    expect(css).toContain(".button:not(.text):active:not(:disabled)");
    expect(css).toContain("transform: translate(1px, 1px);");
    expect(css).toContain("box-shadow: none;");
  });

  it("keeps text-link controls flat", () => {
    expect(css).toContain(".text { background: transparent;");
    expect(css).toContain("box-shadow: none;");
  });
});

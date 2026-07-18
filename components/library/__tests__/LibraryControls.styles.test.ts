import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(process.cwd(), "components/library/LibraryControls.module.css"),
  "utf8",
);

function declarationsFor(selector: string): Record<string, string>[] {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return [...css.matchAll(new RegExp(`${escaped}\\s*\\{([^}]*)\\}`, "g"))].map(
    ([, body]) =>
      Object.fromEntries(
        body
          .split(";")
          .map((declaration) => declaration.trim())
          .filter(Boolean)
          .map((declaration) => {
            const separator = declaration.indexOf(":");
            return [
              declaration.slice(0, separator).trim(),
              declaration.slice(separator + 1).trim(),
            ];
          }),
      ),
  );
}

describe("LibraryControls prototype styles", () => {
  it("matches the prototype sort control", () => {
    expect(declarationsFor(".sortLabel")).toContainEqual(
      expect.objectContaining({
        display: "flex",
        "align-items": "center",
        gap: "8px",
        "font-size": "14px",
        color: "var(--ink-muted)",
      }),
    );
    expect(declarationsFor(".sortSelect")).toContainEqual(
      expect.objectContaining({
        height: "var(--tap-target)",
        border: "1px solid var(--border-strong)",
        "border-radius": "var(--radius-control)",
        background: "var(--surface)",
        color: "var(--ink)",
        padding: "0 10px",
        "font-size": "14px",
      }),
    );
  });

  it("keeps the mobile filter action at the prototype size", () => {
    expect(declarationsFor(".doneButton")).toContainEqual(
      expect.objectContaining({
        height: "48px",
        "min-height": "48px",
        "flex-shrink": "0",
        "font-size": "16px",
      }),
    );
  });

  it("prevents the desktop filter action from collapsing below its prototype size", () => {
    expect(declarationsFor(".doneButton")).toContainEqual(
      expect.objectContaining({
        height: "var(--tap-target)",
        "min-height": "var(--tap-target)",
        width: "100%",
        "flex-shrink": "0",
        "font-size": "15px",
      }),
    );
  });
});

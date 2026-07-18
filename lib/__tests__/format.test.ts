import { describe, expect, it } from "vitest";
import {
  formatAmount,
  formatMinutes,
  formatYield,
  isValidYieldInput,
} from "../format";

describe("formatMinutes", () => {
  it("formats sub-hour times", () => {
    expect(formatMinutes(45)).toBe("45 min");
  });
  it("formats exact hours", () => {
    expect(formatMinutes(120)).toBe("2 hr");
  });
  it("formats mixed hours and minutes", () => {
    expect(formatMinutes(225)).toBe("3 hr 45 min");
  });
  it("dashes out missing values", () => {
    expect(formatMinutes(null)).toBe("—");
    expect(formatMinutes(0)).toBe("—");
  });
});

describe("formatAmount", () => {
  it("joins quantity and unit", () => {
    expect(formatAmount("1.2", "kg")).toBe("1.2 kg");
  });
  it("handles unitless quantities", () => {
    expect(formatAmount("2", "")).toBe("2");
  });
  it("handles empty amounts", () => {
    expect(formatAmount("", "")).toBe("");
  });
});

describe("formatYield", () => {
  it("adds context to bare serving quantities", () => {
    expect(formatYield("2")).toBe("Serves 2");
    expect(formatYield("1 to 2 guys")).toBe("Serves 1 to 2 guys");
  });

  it("keeps and normalizes explicit yield wording", () => {
    expect(formatYield("Makes 24")).toBe("Makes 24");
    expect(formatYield("serves 6")).toBe("Serves 6");
  });

  it("handles missing yields", () => {
    expect(formatYield("")).toBe("");
    expect(formatYield(null)).toBe("");
  });
});

describe("isValidYieldInput", () => {
  it("accepts quantity-first and explicit yields", () => {
    expect(isValidYieldInput("2")).toBe(true);
    expect(isValidYieldInput("1 to 2")).toBe(true);
    expect(isValidYieldInput("Makes one loaf")).toBe(true);
    expect(isValidYieldInput("Serves a crowd")).toBe(true);
  });

  it("rejects ambiguous non-empty text", () => {
    expect(isValidYieldInput("a lot")).toBe(false);
    expect(isValidYieldInput("Makes")).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import { formatAmount, formatMinutes } from "../format";

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

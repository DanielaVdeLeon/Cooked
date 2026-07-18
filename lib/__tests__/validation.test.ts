import { describe, expect, it } from "vitest";
import {
  loginSchema,
  safeNext,
  signupSchema,
  updatePasswordSchema,
} from "../validation";

describe("loginSchema (AC-AUTH-001 input validation)", () => {
  it("accepts a normal login", () => {
    const r = loginSchema.safeParse({ email: "Cook@Example.com", password: "hunter22" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("cook@example.com");
  });
  it("rejects malformed email", () => {
    expect(loginSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
  });
  it("rejects empty password", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.co", password: "" }).success,
    ).toBe(false);
  });
});

describe("signupSchema (viewer signup, length limits)", () => {
  it("enforces 8-character passwords", () => {
    expect(
      signupSchema.safeParse({
        displayName: "Dani",
        email: "a@b.co",
        password: "short",
      }).success,
    ).toBe(false);
  });
  it("caps display names at 80 characters", () => {
    expect(
      signupSchema.safeParse({
        displayName: "x".repeat(81),
        email: "a@b.co",
        password: "longenough",
      }).success,
    ).toBe(false);
  });
});

describe("updatePasswordSchema", () => {
  it("requires matching confirmation", () => {
    expect(
      updatePasswordSchema.safeParse({ password: "longenough", confirm: "different1" })
        .success,
    ).toBe(false);
  });
});

describe("safeNext (open-redirect guard on ?next=)", () => {
  it("allows same-origin paths", () => {
    expect(safeNext("/recipes/cacio-e-pepe")).toBe("/recipes/cacio-e-pepe");
  });
  it("falls back on absolute URLs", () => {
    expect(safeNext("https://evil.example")).toBe("/");
  });
  it("falls back on protocol-relative URLs", () => {
    expect(safeNext("//evil.example")).toBe("/");
  });
  it("falls back on backslash tricks and non-strings", () => {
    expect(safeNext("/\\evil.example")).toBe("/");
    expect(safeNext(undefined)).toBe("/");
    expect(safeNext(42)).toBe("/");
  });
});

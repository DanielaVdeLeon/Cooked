import { describe, expect, it } from "vitest";
import {
  accountSettingsSchema,
  deleteAccountSchema,
  allErrors,
} from "../validation";

const base = {
  displayName: "Dani",
  email: "dani@example.com",
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

describe("accountSettingsSchema (AC-ACC-001)", () => {
  it("accepts name/email changes without touching the password", () => {
    expect(accountSettingsSchema.safeParse(base).success).toBe(true);
  });

  it("requires the current password when changing the password", () => {
    const r = accountSettingsSchema.safeParse({
      ...base,
      newPassword: "longenough1",
      confirmPassword: "longenough1",
    });
    expect(r.success).toBe(false);
    expect(allErrors(r)).toContain("Enter your current password to change it.");
  });

  it("requires matching password confirmation", () => {
    const r = accountSettingsSchema.safeParse({
      ...base,
      currentPassword: "old-password",
      newPassword: "longenough1",
      confirmPassword: "different1",
    });
    expect(r.success).toBe(false);
    expect(allErrors(r)).toContain("New passwords do not match.");
  });

  it("enforces the 8-character minimum on new passwords", () => {
    expect(
      accountSettingsSchema.safeParse({
        ...base,
        currentPassword: "old-password",
        newPassword: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });

  it("caps display names at 80 characters", () => {
    expect(
      accountSettingsSchema.safeParse({ ...base, displayName: "x".repeat(81) })
        .success,
    ).toBe(false);
  });
});

describe("deleteAccountSchema", () => {
  it("requires the current password", () => {
    expect(deleteAccountSchema.safeParse({ currentPassword: "" }).success).toBe(false);
    expect(deleteAccountSchema.safeParse({ currentPassword: "pw" }).success).toBe(true);
  });
});

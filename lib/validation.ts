import { z } from "zod";

/** Server-side validation schemas (every mutation validates before Supabase).
    Length limits everywhere user text enters the system. */

export const emailSchema = z
  .email({ error: "Enter a valid email address." })
  .trim()
  .toLowerCase()
  .max(254, { error: "Email is too long." });

export const passwordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters." })
  .max(72, { error: "Password is too long." });

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter a display name." })
  .max(80, { error: "Display name must be 80 characters or fewer." });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, { error: "Enter your password." }).max(72),
});

export const signupSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const resetRequestSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z
  .object({
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    error: "Passwords do not match.",
    path: ["confirm"],
  });

/* ----------------------------------------------------------------- settings */

export const accountSettingsSchema = z
  .object({
    displayName: displayNameSchema,
    email: emailSchema,
    currentPassword: z.string().max(72),
    newPassword: z.union([z.literal(""), passwordSchema]),
    confirmPassword: z.string().max(72),
  })
  .refine((v) => v.newPassword === "" || v.newPassword === v.confirmPassword, {
    error: "New passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((v) => v.newPassword === "" || v.currentPassword.length > 0, {
    error: "Enter your current password to change it.",
    path: ["currentPassword"],
  });

export const deleteAccountSchema = z.object({
  currentPassword: z
    .string()
    .min(1, { error: "Enter your current password to delete the account." })
    .max(72),
});

/* -------------------------------------------------------------------- notes */

export const noteBodySchema = z
  .string()
  .trim()
  .min(1, { error: "Write something first." })
  .max(2000, { error: "Notes must be 2000 characters or fewer." });

/* ------------------------------------------------------------------ recipes */

const ingredientRowSchema = z.object({
  quantity: z.string().trim().max(40, { error: "Quantities must be 40 characters or fewer." }),
  unit: z.string().trim().max(40, { error: "Units must be 40 characters or fewer." }),
  name: z
    .string()
    .trim()
    .min(1, { error: "Every ingredient row needs a name." })
    .max(120, { error: "Ingredient names must be 120 characters or fewer." }),
  isHeading: z.boolean(),
});

const instructionRowSchema = z.object({
  sectionHeading: z
    .string()
    .trim()
    .max(120, { error: "Section headings must be 120 characters or fewer." })
    .transform((v) => (v === "" ? null : v))
    .nullable(),
  text: z
    .string()
    .trim()
    .min(1, { error: "Every step needs text." })
    .max(2000, { error: "Steps must be 2000 characters or fewer." }),
  timerMinutes: z
    .number()
    .int()
    .min(1, { error: "Timers must be at least 1 minute." })
    .max(6000, { error: "Timers must be 6000 minutes or fewer." })
    .nullable(),
});

export const recipeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Add a title." })
    .max(120, { error: "Titles must be 120 characters or fewer." }),
  description: z
    .string()
    .trim()
    .max(2000, { error: "Descriptions must be 2000 characters or fewer." }),
  servings: z.string().trim().max(40, { error: "Serves must be 40 characters or fewer." }),
  sourceName: z
    .string()
    .trim()
    .max(120, { error: "Source names must be 120 characters or fewer." }),
  sourceUrl: z.union(
    [
      z.literal(""),
      z
        .url({
          protocol: /^https?$/,
          error: "Source URLs must start with http:// or https://.",
        })
        .max(500, { error: "Source URLs must be 500 characters or fewer." }),
    ],
    { error: "Source URLs must start with http:// or https://." },
  ),
  prepMinutes: z.number().int().min(0).max(6000).nullable(),
  cookMinutes: z.number().int().min(0).max(6000).nullable(),
  imagePath: z
    .string()
    .max(300)
    .regex(/^[\w.\-/]+$/, { error: "Invalid image reference." })
    .nullable(),
  ingredients: z
    .array(ingredientRowSchema)
    .max(100, { error: "Recipes are limited to 100 ingredient rows." })
    .refine((rows) => rows.some((r) => !r.isHeading), {
      error: "Add at least one ingredient.",
    }),
  instructions: z
    .array(instructionRowSchema)
    .max(100, { error: "Recipes are limited to 100 steps." }),
  tags: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(40, { error: "Tags must be 40 characters or fewer." }),
    )
    .max(20, { error: "Recipes are limited to 20 tags." }),
});

export type RecipeInput = z.infer<typeof recipeSchema>;

/** All error messages from a failed parse — the recipe form lists them. */
export function allErrors(result: { error?: z.ZodError }): string[] {
  const messages = (result.error?.issues ?? []).map((i) => i.message);
  return [...new Set(messages)];
}

/** URL slug from a title: lowercase a–z0–9 with single hyphens. */
export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return slug || "recipe";
}

/** First error message from a failed parse — the auth forms show one alert. */
export function firstError(result: { error?: z.ZodError }): string {
  return result.error?.issues[0]?.message ?? "Please check the form and try again.";
}

/** Only ever redirect within the app: a same-origin path like "/recipes/x".
    Anything absolute, protocol-relative, or malformed falls back (prevents
    open redirects via ?next=). */
export function safeNext(raw: unknown, fallback = "/"): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 500) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback;
  return raw;
}

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

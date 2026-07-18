"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction, type AuthActionState } from "@/app/(auth)/actions";
import styles from "./auth-forms.module.css";

export function SignupForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    signupAction,
    {},
  );

  if (state.ok) {
    return (
      <>
        <div role="status" className={styles.success}>
          {state.message}
        </div>
        <Link
          href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className={styles.textLink}
        >
          Back to log in
        </Link>
      </>
    );
  }

  return (
    <form action={formAction}>
      {state.error ? (
        <div role="alert" className={styles.alert}>
          {state.error}
        </div>
      ) : null}
      <label htmlFor="signup-name" className={styles.label}>
        Display name
      </label>
      <input
        id="signup-name"
        name="displayName"
        type="text"
        autoComplete="name"
        required
        maxLength={80}
        placeholder="How notes will credit you"
        className={styles.input}
      />
      <label htmlFor="signup-email" className={styles.label}>
        Email
      </label>
      <input
        id="signup-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        className={styles.input}
      />
      <label htmlFor="signup-pass" className={styles.label}>
        Password
      </label>
      <input
        id="signup-pass"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="At least 8 characters"
        className={`${styles.input} ${styles.lastInput}`}
      />
      <button type="submit" disabled={pending} className={styles.submit}>
        {pending ? "Creating account…" : "Create account"}
      </button>
      <Link
        href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
        className={styles.textLink}
      >
        Already have an account? Log in
      </Link>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { resetRequestAction, type AuthActionState } from "@/app/(auth)/actions";
import styles from "./auth-forms.module.css";

export function ResetRequestForm() {
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    resetRequestAction,
    {},
  );

  if (state.ok) {
    return (
      <div role="status" className={styles.success}>
        {state.message}
      </div>
    );
  }

  return (
    <form action={formAction}>
      {state.error ? (
        <div role="alert" className={styles.alert}>
          {state.error}
        </div>
      ) : null}
      <label htmlFor="reset-email" className={styles.label}>
        Email
      </label>
      <input
        id="reset-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        className={`${styles.input} ${styles.lastInput}`}
      />
      <button type="submit" disabled={pending} className={styles.submit}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}

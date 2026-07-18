"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updatePasswordAction, type AuthActionState } from "@/app/(auth)/actions";
import { useToast } from "@/components/ui/Toast";
import styles from "./auth-forms.module.css";

export function UpdatePasswordForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    updatePasswordAction,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      showToast("Password updated", "success");
      router.push("/");
      router.refresh();
    }
  }, [state, router, showToast]);

  return (
    <form action={formAction}>
      {state.error ? (
        <div role="alert" className={styles.alert}>
          {state.error}
        </div>
      ) : null}
      <label htmlFor="new-pass" className={styles.label}>
        New password
      </label>
      <input
        id="new-pass"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        placeholder="At least 8 characters"
        className={styles.input}
      />
      <label htmlFor="new-pass2" className={styles.label}>
        Confirm new password
      </label>
      <input
        id="new-pass2"
        name="confirm"
        type="password"
        autoComplete="new-password"
        required
        placeholder="••••••••"
        className={`${styles.input} ${styles.lastInput}`}
      />
      <button type="submit" disabled={pending} className={styles.submit}>
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

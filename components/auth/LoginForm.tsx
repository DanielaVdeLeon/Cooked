"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAction, type AuthActionState } from "@/app/(auth)/actions";
import { useToast } from "@/components/ui/Toast";
import styles from "./auth-forms.module.css";

export function LoginForm({ next, linkError }: { next: string; linkError?: boolean }) {
  const router = useRouter();
  const { showToast } = useToast();
  const [state, formAction, pending] = useActionState<AuthActionState, FormData>(
    loginAction,
    {},
  );

  useEffect(() => {
    if (state.ok) {
      showToast("Signed in", "success");
      router.push(state.next ?? "/");
      router.refresh();
    }
  }, [state, router, showToast]);

  return (
    <form action={formAction}>
      <input type="hidden" name="next" value={next} />
      {state.error ? (
        <div role="alert" className={styles.alert}>
          {state.error}
        </div>
      ) : linkError ? (
        <div role="alert" className={styles.alert}>
          That link has expired or was already used. Log in or request a new one.
        </div>
      ) : null}
      <label htmlFor="login-email" className={styles.label}>
        Email
      </label>
      <input
        id="login-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="you@example.com"
        className={styles.input}
      />
      <label htmlFor="login-pass" className={styles.label}>
        Password
      </label>
      <input
        id="login-pass"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        placeholder="••••••••"
        className={`${styles.input} ${styles.lastInput}`}
      />
      <button type="submit" disabled={pending} className={styles.submit}>
        {pending ? "Logging in…" : "Log in"}
      </button>
      <Link href="/reset-password" className={styles.textLink}>
        Forgot password?
      </Link>
      <Link
        href={`/signup${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
        className={styles.textLink}
      >
        Create an account
      </Link>
    </form>
  );
}

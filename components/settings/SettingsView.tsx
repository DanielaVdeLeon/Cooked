"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAccountAction,
  updateAccountAction,
  type SettingsActionState,
} from "@/app/settings/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import styles from "./SettingsView.module.css";

/** Settings — full-screen overlay per the prototype: orange header
    (‹ Back | Settings), “Your account” card, red-bordered delete card. */
export function SettingsView({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  const [saveState, saveAction, saving] = useActionState<SettingsActionState, FormData>(
    updateAccountAction,
    {},
  );
  const [deleteState, deleteFormAction, deleting] = useActionState<
    SettingsActionState,
    FormData
  >(deleteAccountAction, {});

  useEffect(() => {
    if (saveState.ok && saveState.message) {
      showToast(saveState.message, "success");
      router.refresh();
    }
  }, [saveState, showToast, router]);

  useEffect(() => {
    if (deleteState.ok) {
      showToast("Account deleted", "danger");
      router.push("/");
      router.refresh();
    }
  }, [deleteState, router, showToast]);

  function onBack() {
    if (window.history.length > 2) router.back();
    else router.push("/");
  }

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button type="button" className={styles.back} onClick={onBack}>
            ‹ Back
          </button>
          <p className={styles.heading}>Settings</p>
        </div>
      </header>

      <div className={styles.body}>
        <form action={saveAction} className={styles.card}>
          <h1 className={styles.cardTitle}>Your account</h1>
          <p className={styles.hint}>
            Leave the password fields empty to keep your current password.
          </p>
          {saveState.error ? (
            <div role="alert" className={styles.alert}>
              {saveState.error}
            </div>
          ) : null}

          <label htmlFor="set-name" className={styles.label}>
            Name
          </label>
          <input
            id="set-name"
            name="displayName"
            defaultValue={displayName}
            maxLength={80}
            required
            className={styles.input}
          />

          <label htmlFor="set-email" className={styles.label}>
            Email
          </label>
          <input
            id="set-email"
            name="email"
            type="email"
            defaultValue={email}
            autoComplete="email"
            required
            className={styles.input}
          />

          <label htmlFor="set-current" className={styles.label}>
            Current password
          </label>
          <input
            id="set-current"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            placeholder="Needed to change your password"
            className={styles.input}
          />

          <label htmlFor="set-pass" className={styles.label}>
            New password
          </label>
          <input
            id="set-pass"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            placeholder="At least 8 characters"
            className={styles.input}
          />

          <label htmlFor="set-pass2" className={styles.label}>
            Confirm new password
          </label>
          <input
            id="set-pass2"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            className={`${styles.input} ${styles.lastInput}`}
          />

          <button type="submit" disabled={saving} className={styles.save}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        <div className={`${styles.card} ${styles.dangerCard}`}>
          <h2 className={styles.dangerTitle}>Delete account</h2>
          <p className={styles.hint}>
            Removes your access and signs you out. Recipes stay in the library.
          </p>
          {deleteState.error ? (
            <div role="alert" className={styles.alert}>
              {deleteState.error}
            </div>
          ) : null}
          <label htmlFor="del-pass" className={styles.label}>
            Current password
          </label>
          <input
            id="del-pass"
            type="password"
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
            autoComplete="current-password"
            placeholder="Confirm it’s you"
            className={styles.input}
          />
          <button
            type="button"
            disabled={deleting || deletePassword.length === 0}
            onClick={() => setConfirmDelete(true)}
            className={styles.deleteButton}
          >
            {deleting ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        message="This removes your access permanently and signs you out. Recipes stay in the library."
        confirmLabel="Delete account"
        cancelLabel="Cancel"
        danger
        onConfirm={() => {
          setConfirmDelete(false);
          const form = new FormData();
          form.set("currentPassword", deletePassword);
          deleteFormAction(form);
        }}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

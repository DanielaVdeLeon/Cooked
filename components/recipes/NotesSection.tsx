"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addNoteAction,
  deleteNoteAction,
  updateNoteAction,
} from "@/app/recipes/note-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/format";
import type { FullRecipe } from "@/lib/library";
import styles from "./NotesSection.module.css";

const NOTE_TONES = [styles.noteYellow, styles.noteBlue, styles.noteOrange];

type Viewer = {
  id: string;
  isEditor: boolean;
  isAdmin: boolean;
} | null;

type NotesSectionProps = {
  recipeId: string;
  slug: string;
  notes: FullRecipe["notes"];
  viewer: Viewer;
};

/** Dated post-it notes (public read, AC-PUB-005) with the editor composer
    and author-scoped edit/delete (AC-AUTH-011). */
export function NotesSection({ recipeId, slug, notes, viewer }: NotesSectionProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const canManage = (authorId: string | null) =>
    !!viewer && viewer.isEditor && (viewer.isAdmin || authorId === viewer.id);

  function startEdit(noteId: string, body: string) {
    setEditingId(noteId);
    setDraft(body);
    setError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft("");
    setError(null);
  }

  async function onSave() {
    setPending(true);
    setError(null);
    const result = editingId
      ? await updateNoteAction({ noteId: editingId, slug, body: draft })
      : await addNoteAction({ recipeId, slug, body: draft });
    setPending(false);

    if (!result.ok) {
      setError(result.error ?? "Could not save the note.");
      return;
    }
    showToast(editingId ? "Note updated" : "Note added", "success");
    cancelEdit();
    router.refresh();
  }

  async function onDelete() {
    const noteId = confirmDeleteId;
    setConfirmDeleteId(null);
    if (!noteId) return;
    const result = await deleteNoteAction({ noteId, slug });
    if (!result.ok) {
      setError(result.error ?? "Could not delete the note.");
      return;
    }
    if (editingId === noteId) cancelEdit();
    showToast("Note deleted", "danger");
    router.refresh();
  }

  return (
    <section aria-label="Notes">
      <h2 className={styles.notesTitle}>Notes</h2>
      <p className={styles.notesHint}>
        Share your spiciest (recipe related) take.
      </p>

      {notes.length > 0 ? (
        <div className={styles.notes}>
          {notes.map((note, i) => (
            <div
              key={note.id}
              className={`${styles.note} ${NOTE_TONES[i % NOTE_TONES.length]} ${
                i % 2 === 0 ? styles.noteTiltA : styles.noteTiltB
              }`}
            >
              <p className={styles.noteText}>{note.body}</p>
              <div className={styles.noteFooterRow}>
                <p className={styles.noteByline}>
                  {[
                    note.author_name,
                    formatDate(note.created_at),
                    note.updated_at > note.created_at ? "edited" : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
                {canManage(note.author_id) ? (
                  <div className={styles.noteActions}>
                    <button
                      type="button"
                      className={styles.noteEdit}
                      onClick={() => startEdit(note.id, note.body)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className={styles.noteDelete}
                      onClick={() => setConfirmDeleteId(note.id)}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noNotes}>No notes yet.</p>
      )}

      {viewer?.isEditor ? (
        <div className={styles.composer}>
          <label htmlFor="note-input" className={styles.composerLabel}>
            {editingId ? "Edit note" : "Add a note"}
          </label>
          {error ? (
            <p role="alert" className={styles.composerError}>
              {error}
            </p>
          ) : null}
          <textarea
            id="note-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="e.g. Grate a little cheese 👀"
            className={styles.composerInput}
          />
          <div className={styles.composerActions}>
            <button
              type="button"
              onClick={onSave}
              disabled={pending}
              className={styles.composerSave}
            >
              {pending ? "Saving…" : editingId ? "Update note" : "Save note"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={cancelEdit}
                className={styles.composerCancel}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <p className={styles.notesFooter}>
          Notes are added by Cooked editors.{" "}
          <Link href={`/login?next=${encodeURIComponent(`/recipes/${slug}`)}`}>
            Log in
          </Link>{" "}
          if you have editing access.
        </p>
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        title="Delete note?"
        message="This note will be removed permanently."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        danger
        onConfirm={onDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </section>
  );
}

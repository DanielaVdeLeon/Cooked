"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfile } from "@/lib/auth";
import { firstError, noteBodySchema } from "@/lib/validation";

export type NoteActionResult = { ok: boolean; error?: string };

/** AC-AUTH-011 + AC-SEC-001: every note mutation verifies authentication and
    editor permission server-side; update/delete additionally verify the
    caller authored the note (admins may modify any note). RLS enforces the
    same rules independently. */
async function requireEditor() {
  const profile = await getSessionProfile();
  if (!profile) return { profile: null, error: "You need to log in to do that." };
  if (!profile.isEditor)
    return { profile: null, error: "Editor access is required to manage notes." };
  return { profile, error: null };
}

export async function addNoteAction(input: {
  recipeId: string;
  slug: string;
  body: unknown;
}): Promise<NoteActionResult> {
  const { profile, error } = await requireEditor();
  if (!profile) return { ok: false, error: error! };

  const parsed = noteBodySchema.safeParse(input.body);
  if (!parsed.success) return { ok: false, error: firstError(parsed) };

  const supabase = await createClient();
  const { error: insertError } = await supabase.from("notes").insert({
    recipe_id: input.recipeId,
    author_id: profile.id,
    body: parsed.data,
  });
  if (insertError) return { ok: false, error: "Could not save the note." };

  revalidatePath(`/recipes/${input.slug}`);
  return { ok: true };
}

export async function updateNoteAction(input: {
  noteId: string;
  slug: string;
  body: unknown;
}): Promise<NoteActionResult> {
  const { profile, error } = await requireEditor();
  if (!profile) return { ok: false, error: error! };

  const parsed = noteBodySchema.safeParse(input.body);
  if (!parsed.success) return { ok: false, error: firstError(parsed) };

  const supabase = await createClient();
  const { data: note } = await supabase
    .from("notes")
    .select("author_id")
    .eq("id", input.noteId)
    .maybeSingle();
  if (!note) return { ok: false, error: "Note not found." };
  if (note.author_id !== profile.id && profile.role !== "admin") {
    return { ok: false, error: "You can only edit notes you wrote." };
  }

  const { data: updated, error: updateError } = await supabase
    .from("notes")
    .update({ body: parsed.data })
    .eq("id", input.noteId)
    .select("id");
  if (updateError || !updated || updated.length === 0) {
    return { ok: false, error: "Could not update the note." };
  }

  revalidatePath(`/recipes/${input.slug}`);
  return { ok: true };
}

export async function deleteNoteAction(input: {
  noteId: string;
  slug: string;
}): Promise<NoteActionResult> {
  const { profile, error } = await requireEditor();
  if (!profile) return { ok: false, error: error! };

  const supabase = await createClient();
  const { data: note } = await supabase
    .from("notes")
    .select("author_id")
    .eq("id", input.noteId)
    .maybeSingle();
  if (!note) return { ok: false, error: "Note not found." };
  if (note.author_id !== profile.id && profile.role !== "admin") {
    return { ok: false, error: "You can only delete notes you wrote." };
  }

  const { data: deleted, error: deleteError } = await supabase
    .from("notes")
    .delete()
    .eq("id", input.noteId)
    .select("id");
  if (deleteError || !deleted || deleted.length === 0) {
    return { ok: false, error: "Could not delete the note." };
  }

  revalidatePath(`/recipes/${input.slug}`);
  return { ok: true };
}

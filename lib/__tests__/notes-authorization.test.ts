import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Live note authorisation (AC-AUTH-011, AC-SEC-001): notes are author-scoped —
 * one editor cannot modify another editor's note, enforced by RLS at the
 * endpoint. Uses the two QA editor accounts; creates a note and always cleans
 * it up. Skips when Supabase env vars are absent.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasEnv = Boolean(url && anonKey);

const AUTHOR = { email: "testcook@example.com", password: "test-cook-pass-1" };
const OTHER_EDITOR = { email: "testcook2@example.com", password: "test-cook-pass-2" };
const NOTE_BODY = "[qa] author-scoping check — safe to delete";

function client(): SupabaseClient<Database> {
  return createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });
}

describe.runIf(hasEnv)("note author scoping (AC-AUTH-011)", () => {
  // Created in beforeAll: the describe body runs at collection time even
  // when runIf skips the tests (e.g. CI without Supabase env).
  let author: SupabaseClient<Database>;
  let other: SupabaseClient<Database>;
  let recipeId = "";
  let noteId = "";

  beforeAll(async () => {
    author = client();
    other = client();
    const [a, b] = await Promise.all([
      author.auth.signInWithPassword(AUTHOR),
      other.auth.signInWithPassword(OTHER_EDITOR),
    ]);
    expect(a.error).toBeNull();
    expect(b.error).toBeNull();

    const { data: recipe } = await author
      .from("recipes")
      .select("id")
      .limit(1)
      .single();
    recipeId = recipe!.id;

    // Clean up any orphans from earlier failed runs, then create the fixture.
    await author.from("notes").delete().eq("body", NOTE_BODY);
    const { data: note, error } = await author
      .from("notes")
      .insert({
        recipe_id: recipeId,
        author_id: (await author.auth.getUser()).data.user!.id,
        body: NOTE_BODY,
      })
      .select("id")
      .single();
    expect(error).toBeNull();
    noteId = note!.id;
  });

  afterAll(async () => {
    if (noteId) await author.from("notes").delete().eq("id", noteId);
  });

  it("the note is publicly readable (AC-PUB-005)", async () => {
    const { data } = await client().from("notes").select("body").eq("id", noteId);
    expect(data?.map((n) => n.body)).toContain(NOTE_BODY);
  });

  it("another editor cannot update the note", async () => {
    const { data } = await other
      .from("notes")
      .update({ body: "hijacked" })
      .eq("id", noteId)
      .select("id");
    expect(data ?? []).toHaveLength(0);

    const { data: unchanged } = await author
      .from("notes")
      .select("body")
      .eq("id", noteId)
      .single();
    expect(unchanged!.body).toBe(NOTE_BODY);
  });

  it("another editor cannot delete the note", async () => {
    const { data } = await other.from("notes").delete().eq("id", noteId).select("id");
    expect(data ?? []).toHaveLength(0);

    const { data: still } = await author
      .from("notes")
      .select("id")
      .eq("id", noteId)
      .maybeSingle();
    expect(still).not.toBeNull();
  });

  it("the author can update their own note (edited flag data)", async () => {
    const { data, error } = await author
      .from("notes")
      .update({ body: `${NOTE_BODY} (edited)` })
      .eq("id", noteId)
      .select("body, created_at, updated_at")
      .single();
    expect(error).toBeNull();
    expect(data!.body).toContain("(edited)");
    expect(new Date(data!.updated_at).getTime()).toBeGreaterThan(
      new Date(data!.created_at).getTime(),
    );
  });
});

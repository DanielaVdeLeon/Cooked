import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";
import { orderWithFavourites } from "@/lib/library";

/* ------------------------- unit: snapshot ordering ------------------------- */

describe("orderWithFavourites (AC-FAV-001 ordering)", () => {
  const recipes = [
    { id: "a", title: "newest" },
    { id: "b", title: "middle" },
    { id: "c", title: "oldest" },
    { id: "d", title: "old-fav" },
  ];

  it("puts favourites first, most recently favourited first", () => {
    const favs = new Map([
      ["c", "2026-07-10T00:00:00Z"],
      ["d", "2026-07-15T00:00:00Z"],
    ]);
    expect(orderWithFavourites(recipes, favs).map((r) => r.id)).toEqual([
      "d",
      "c",
      "a",
      "b",
    ]);
  });

  it("keeps non-favourites in their existing recency order", () => {
    const favs = new Map([["b", "2026-07-10T00:00:00Z"]]);
    expect(orderWithFavourites(recipes, favs).map((r) => r.id)).toEqual([
      "b",
      "a",
      "c",
      "d",
    ]);
  });

  it("is a no-op with no favourites", () => {
    expect(orderWithFavourites(recipes, new Map()).map((r) => r.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });
});

/* -------------------- live: per-user isolation (RLS) ---------------------- */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasEnv = Boolean(url && anonKey);

const USER_A = { email: "testcook@example.com", password: "test-cook-pass-1" };
const USER_B = { email: "testcook2@example.com", password: "test-cook-pass-2" };

describe.runIf(hasEnv)("favourites are per-user (AC-FAV-001, AC-SEC-001)", () => {
  let a: SupabaseClient<Database>;
  let b: SupabaseClient<Database>;
  let aId = "";
  let recipeId = "";

  beforeAll(async () => {
    a = createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });
    b = createClient<Database>(url!, anonKey!, { auth: { persistSession: false } });
    const [ra, rb] = await Promise.all([
      a.auth.signInWithPassword(USER_A),
      b.auth.signInWithPassword(USER_B),
    ]);
    expect(ra.error).toBeNull();
    expect(rb.error).toBeNull();
    aId = ra.data.user!.id;

    const { data: recipe } = await a.from("recipes").select("id").limit(1).single();
    recipeId = recipe!.id;
    await a.from("favourites").delete().eq("recipe_id", recipeId);
  });

  afterAll(async () => {
    await a.from("favourites").delete().eq("recipe_id", recipeId);
  });

  it("a user can favourite and reads only their own rows", async () => {
    const { error } = await a
      .from("favourites")
      .insert({ user_id: aId, recipe_id: recipeId });
    expect(error).toBeNull();

    const { data: mine } = await a.from("favourites").select("recipe_id");
    expect(mine!.map((f) => f.recipe_id)).toContain(recipeId);
  });

  it("another user cannot see those favourites", async () => {
    const { data: theirs } = await b
      .from("favourites")
      .select("recipe_id")
      .eq("recipe_id", recipeId);
    expect(theirs).toHaveLength(0);
  });

  it("a user cannot write favourites as someone else", async () => {
    const { error } = await b
      .from("favourites")
      .insert({ user_id: aId, recipe_id: recipeId });
    expect(error).not.toBeNull();
  });

  it("another user cannot delete someone else's favourite", async () => {
    const { data: deleted } = await b
      .from("favourites")
      .delete()
      .eq("user_id", aId)
      .eq("recipe_id", recipeId)
      .select("recipe_id");
    expect(deleted ?? []).toHaveLength(0);

    const { data: still } = await a
      .from("favourites")
      .select("recipe_id")
      .eq("recipe_id", recipeId);
    expect(still).toHaveLength(1);
  });
});

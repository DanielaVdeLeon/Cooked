import { describe, expect, it } from "vitest";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Endpoint-level authorisation tests (AC-SEC-001, AC-E2E-003).
 * These hit the live Supabase REST API as an *anonymous* client, proving RLS
 * independently of any UI. They run wherever NEXT_PUBLIC_SUPABASE_URL and
 * NEXT_PUBLIC_SUPABASE_ANON_KEY are configured and skip otherwise.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const hasEnv = Boolean(url && anonKey);

function anonClient() {
  return createClient<Database>(url!, anonKey!, {
    auth: { persistSession: false },
  });
}

describe.runIf(hasEnv)("anonymous access (AC-PUB-001, AC-PUB-004)", () => {
  it("sees only published recipes", async () => {
    const { data, error } = await anonClient()
      .from("recipes")
      .select("status");
    expect(error).toBeNull();
    expect(data!.length).toBeGreaterThan(0);
    expect(data!.every((r) => r.status === "published")).toBe(true);
  });

  it("search_recipes never returns unpublished recipes", async () => {
    const { data, error } = await anonClient().rpc("search_recipes", {
      q: "",
      tag_ids: [],
    });
    expect(error).toBeNull();
    expect(data!.every((r) => r.status === "published")).toBe(true);
  });
});

describe.runIf(hasEnv)(
  "anonymous writes are rejected (AC-AUTH-001..005, AC-SEC-001, AC-E2E-003)",
  () => {
    it("cannot create a recipe", async () => {
      const { data, error } = await anonClient()
        .from("recipes")
        .insert({ slug: "anon-attack", title: "Anon attack" })
        .select();
      expect(error).not.toBeNull();
      expect(data).toBeNull();
    });

    it("cannot modify an existing recipe", async () => {
      const supabase = anonClient();
      const { data: before } = await supabase
        .from("recipes")
        .select("id, title")
        .limit(1)
        .single();
      const { data: updated } = await supabase
        .from("recipes")
        .update({ title: "HACKED" })
        .eq("id", before!.id)
        .select();
      expect(updated ?? []).toHaveLength(0);

      const { data: after } = await supabase
        .from("recipes")
        .select("title")
        .eq("id", before!.id)
        .single();
      expect(after!.title).toBe(before!.title);
    });

    it("cannot delete a recipe", async () => {
      const supabase = anonClient();
      const { data: target } = await supabase
        .from("recipes")
        .select("id")
        .limit(1)
        .single();
      const { data: deleted } = await supabase
        .from("recipes")
        .delete()
        .eq("id", target!.id)
        .select();
      expect(deleted ?? []).toHaveLength(0);

      const { data: still } = await supabase
        .from("recipes")
        .select("id")
        .eq("id", target!.id)
        .maybeSingle();
      expect(still).not.toBeNull();
    });

    it("cannot create a note", async () => {
      const supabase = anonClient();
      const { data: recipe } = await supabase
        .from("recipes")
        .select("id")
        .limit(1)
        .single();
      const { error } = await supabase
        .from("notes")
        .insert({ recipe_id: recipe!.id, body: "anon note" });
      expect(error).not.toBeNull();
    });

    it("cannot create a tag", async () => {
      const { error } = await anonClient()
        .from("tags")
        .insert({ name: "anon-tag" });
      expect(error).not.toBeNull();
    });
  },
);

describe.runIf(hasEnv)("favourites are per-user (AC-FAV-001, AC-SEC-001)", () => {
  it("anonymous clients read no favourite rows", async () => {
    const { data, error } = await anonClient().from("favourites").select("*");
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it("anonymous clients cannot write favourites", async () => {
    const supabase = anonClient();
    const { data: recipe } = await supabase
      .from("recipes")
      .select("id")
      .limit(1)
      .single();
    const { error } = await supabase.from("favourites").insert({
      user_id: "00000000-0000-4000-8000-000000000000",
      recipe_id: recipe!.id,
    });
    expect(error).not.toBeNull();
  });
});

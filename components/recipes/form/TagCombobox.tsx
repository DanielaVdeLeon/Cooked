"use client";

import { useMemo, useState } from "react";
import type { TagUsage } from "@/lib/library";
import styles from "./TagCombobox.module.css";

const SUGGESTION_LIMIT = 12;
const MAX_TAGS = 20;

type TagComboboxProps = {
  allTags: TagUsage[];
  selected: string[];
  onChange: (tags: string[]) => void;
};

/** Design-system tag combobox: selected paper chips with ×, one search field
    filtering the 12 most-used suggestions, and a dashed create chip for
    unmatched queries (Enter adds/creates). Scales to unbounded tag lists. */
export function TagCombobox({ allTags, selected, onChange }: TagComboboxProps) {
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();
  const selectedLower = useMemo(() => selected.map((t) => t.toLowerCase()), [selected]);

  const suggestions = useMemo(() => {
    return allTags
      .filter((t) => !selectedLower.includes(t.name.toLowerCase()))
      .filter((t) => (query ? t.name.toLowerCase().includes(query) : true))
      .slice(0, SUGGESTION_LIMIT);
  }, [allTags, selectedLower, query]);

  const exactExists =
    selectedLower.includes(query) ||
    allTags.some((t) => t.name.toLowerCase() === query);
  const canCreate = query.length > 0 && query.length <= 40 && !exactExists;
  const atLimit = selected.length >= MAX_TAGS;

  function add(name: string) {
    const clean = name.trim().toLowerCase();
    if (!clean || atLimit || selectedLower.includes(clean)) return;
    onChange([...selected, clean]);
    setSearch("");
  }

  function remove(name: string) {
    onChange(selected.filter((t) => t !== name));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      const match = allTags.find((t) => t.name.toLowerCase() === query);
      if (match) add(match.name);
      else if (suggestions.length === 1) add(suggestions[0].name);
      else if (canCreate) add(query);
    }
  }

  return (
    <div>
      {selected.length > 0 ? (
        <div className={styles.selected}>
          {selected.map((tag) => (
            <span key={tag} className={styles.chip}>
              {tag}
              <button
                type="button"
                aria-label={`Remove tag ${tag}`}
                className={styles.chipRemove}
                onClick={() => remove(tag)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={onKeyDown}
        aria-label="Search or add a tag"
        placeholder="Search or add a tag"
        maxLength={40}
        className={styles.search}
      />
      <div className={styles.suggestions}>
        {suggestions.map((t) => (
          <button
            key={t.id}
            type="button"
            className={styles.suggestion}
            onClick={() => add(t.name)}
            disabled={atLimit}
          >
            + {t.name} <span className={styles.count}>{t.usage_count}</span>
          </button>
        ))}
        {canCreate ? (
          <button
            type="button"
            className={styles.create}
            onClick={() => add(query)}
            disabled={atLimit}
          >
            + Add “{query}”
          </button>
        ) : null}
        {atLimit ? <span className={styles.limit}>Tag limit reached (20).</span> : null}
      </div>
    </div>
  );
}

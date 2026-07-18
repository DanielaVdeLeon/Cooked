"use client";

import { useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { clearFavouritesAction } from "@/app/recipes/favourite-actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { useFavouritesCount } from "./FavouritesContext";
import { LIBRARY_SORTS, LIBRARY_SORTS_AUTHED, type TagUsage } from "@/lib/library";
import styles from "./LibraryControls.module.css";

/** Search, tag filter (popover on desktop, bottom sheet on mobile), and sort.
    All state lives in the URL (?q=&tags=&sort=) so browsing a recipe and
    returning preserves search, filters, and scroll position. */
export function LibraryControls({
  tags,
  authenticated = false,
}: {
  tags: TagUsage[];
  authenticated?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const sort = searchParams.get("sort") ?? "recent";
  const selectedNames = useMemo(
    () =>
      (searchParams.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    [searchParams],
  );

  const [inputValue, setInputValue] = useState(urlQuery);
  const [filterOpen, setFilterOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { showToast } = useToast();
  const favCount = useFavouritesCount();

  const sortOptions = authenticated ? LIBRARY_SORTS_AUTHED : LIBRARY_SORTS;
  // “Clear favourites” appears only while Favourites first is active, the
  // user is authenticated, and they have at least one favourite (AC-FAV-001).
  const showClearFavourites =
    authenticated && sort === "favs" && (favCount?.count ?? 0) > 0;

  async function onClearFavourites() {
    setConfirmClear(false);
    const result = await clearFavouritesAction();
    if (!result.ok) {
      showToast(result.error ?? "Could not clear favourites", "danger");
      return;
    }
    favCount?.reset();
    showToast("Favourites cleared", "danger");
    router.refresh();
  }

  // Re-sync the input when the URL query changes from elsewhere (chip taps,
  // back navigation) — state adjusted during render, not in an effect.
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setInputValue(urlQuery);
  }

  function updateParams(mutate: (params: URLSearchParams) => void) {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function onQueryChange(value: string) {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams((p) => {
        if (value.trim()) p.set("q", value.trim());
        else p.delete("q");
      });
    }, 250);
  }

  function setTags(names: string[]) {
    updateParams((p) => {
      if (names.length > 0) p.set("tags", names.join(","));
      else p.delete("tags");
    });
  }

  function toggleTag(name: string) {
    const lower = name.toLowerCase();
    setTags(
      selectedNames.includes(lower)
        ? selectedNames.filter((t) => t !== lower)
        : [...selectedNames, lower],
    );
  }

  const filteredTags = useMemo(() => {
    const needle = tagSearch.trim().toLowerCase();
    const matches = needle
      ? tags.filter((t) => t.name.toLowerCase().includes(needle))
      : tags;
    // Selected tags pin to the top; the rest keep usage-count order.
    const selected = matches.filter((t) => selectedNames.includes(t.name.toLowerCase()));
    const rest = matches.filter((t) => !selectedNames.includes(t.name.toLowerCase()));
    return [...selected, ...rest];
  }, [tags, tagSearch, selectedNames]);

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span aria-hidden="true" className={styles.searchIcon}>
            ⌕
          </span>
          <input
            type="search"
            value={inputValue}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search recipes, ingredients, tags"
            aria-label="Search recipes"
            maxLength={100}
            className={styles.searchInput}
          />
          {inputValue ? (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
              className={styles.clearSearch}
            >
              ×
            </button>
          ) : null}
        </div>

        <div className={styles.filterWrap}>
          <button
            type="button"
            onClick={() => setFilterOpen((open) => !open)}
            aria-expanded={filterOpen}
            className={styles.filterButton}
          >
            Filters
            {selectedNames.length > 0 ? (
              <span aria-hidden="true" className={styles.filterCount}>
                {selectedNames.length}
              </span>
            ) : null}{" "}
            <span aria-hidden="true" className={styles.caret}>
              ▾
            </span>
          </button>

          {filterOpen ? (
            <>
              <div className={styles.scrim} onClick={() => setFilterOpen(false)} />
              <div role="dialog" aria-label="Filter recipes" className={styles.panel}>
                <div className={styles.panelHead}>
                  <h2 className={styles.panelTitle}>Filter by tag</h2>
                  <button
                    type="button"
                    onClick={() => setTags([])}
                    className={styles.clearAll}
                  >
                    Clear all
                  </button>
                </div>
                <p className={styles.panelHint}>Recipes match all selected tags.</p>
                <div className={styles.tagSearchWrap}>
                  <input
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    aria-label="Find a tag"
                    placeholder="Find a tag"
                    maxLength={40}
                    className={styles.tagSearchInput}
                  />
                  {tagSearch ? (
                    <button
                      type="button"
                      onClick={() => setTagSearch("")}
                      aria-label="Clear tag search"
                      className={styles.clearTagSearch}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
                <div className={styles.tagList}>
                  {filteredTags.length === 0 ? (
                    <p className={styles.noTags}>No tags match “{tagSearch}”.</p>
                  ) : (
                    filteredTags.map((tag) => (
                      <label key={tag.id} className={styles.tagRow}>
                        <input
                          type="checkbox"
                          checked={selectedNames.includes(tag.name.toLowerCase())}
                          onChange={() => toggleTag(tag.name)}
                          aria-label={`Filter by tag ${tag.name}`}
                          className={styles.tagCheckbox}
                        />
                        <span className={styles.tagName}>{tag.name}</span>
                        <span className={styles.tagCount}>{tag.usage_count}</span>
                      </label>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setFilterOpen(false)}
                  className={styles.doneButton}
                >
                  Done
                </button>
              </div>
            </>
          ) : null}
        </div>

        <label className={styles.sortLabel}>
          Sort
          <select
            value={sort}
            onChange={(e) =>
              updateParams((p) => {
                if (e.target.value === "recent") p.delete("sort");
                else p.set("sort", e.target.value);
              })
            }
            aria-label="Sort recipes"
            className={styles.sortSelect}
          >
            {sortOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {showClearFavourites ? (
          <button
            type="button"
            onClick={() => setConfirmClear(true)}
            className={styles.clearFavourites}
          >
            Clear favourites
          </button>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmClear}
        title="Clear favourites?"
        message={`This removes ${favCount?.count ?? 0} ${
          (favCount?.count ?? 0) === 1 ? "favourite" : "favourites"
        }. The recipes themselves are unaffected.`}
        confirmLabel="Clear favourites"
        cancelLabel="Cancel"
        danger
        onConfirm={onClearFavourites}
        onCancel={() => setConfirmClear(false)}
      />

      {selectedNames.length > 0 ? (
        <div className={styles.activeChips}>
          {selectedNames.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => toggleTag(name)}
              aria-label={`Remove filter ${name}`}
              className={styles.activeChip}
            >
              {name} <span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      ) : null}
    </>
  );
}

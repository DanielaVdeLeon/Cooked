import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { LibraryControls } from "../LibraryControls";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ refresh: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/app/recipes/favourite-actions", () => ({
  clearFavouritesAction: vi.fn(),
}));

describe("LibraryControls filter copy", () => {
  it("opens the tag filter without the selection-matching explanation", () => {
    render(
      <ToastProvider>
        <LibraryControls
          tags={[{ id: "tag-1", name: "Quick", usage_count: 3 }]}
        />
      </ToastProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Filters" }));

    expect(screen.getByRole("dialog", { name: "Filter recipes" })).toBeInTheDocument();
    expect(
      screen.queryByText("Recipes match all selected tags."),
    ).not.toBeInTheDocument();
  });
});

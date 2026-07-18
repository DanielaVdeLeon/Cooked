import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/Toast";
import { emptyDraft } from "../draft";
import { RecipeForm } from "../RecipeForm";

const router = vi.hoisted(() => ({
  back: vi.fn(),
  push: vi.fn(),
  refresh: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => router,
}));

vi.mock("@/app/recipes/recipe-actions", () => ({
  deleteRecipeAction: vi.fn(),
  saveRecipeAction: vi.fn(),
}));

const originalHistoryLength = Object.getOwnPropertyDescriptor(window.history, "length");

function renderEditForm() {
  render(
    <ToastProvider>
      <RecipeForm
        mode="edit"
        recipeId="recipe-1"
        recipeSlug="tomato-soup"
        initial={emptyDraft()}
        allTags={[]}
      />
    </ToastProvider>,
  );
}

describe("RecipeForm cancel navigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window.history, "length", {
      configurable: true,
      value: 3,
    });
  });

  afterEach(() => {
    if (originalHistoryLength) {
      Object.defineProperty(window.history, "length", originalHistoryLength);
    } else {
      delete (window.history as unknown as { length?: number }).length;
    }
  });

  it("removes a clean edit form from history when cancelled", () => {
    renderEditForm();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(router.back).toHaveBeenCalledOnce();
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("removes a dirty edit form from history after discard is confirmed", () => {
    renderEditForm();
    fireEvent.change(screen.getByLabelText(/^Title/), {
      target: { value: "Changed title" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(screen.getByRole("button", { name: "Discard" }));

    expect(router.back).toHaveBeenCalledOnce();
    expect(router.push).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });

  it("falls back to the recipe when there is no usable history", () => {
    Object.defineProperty(window.history, "length", {
      configurable: true,
      value: 1,
    });
    renderEditForm();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(router.replace).toHaveBeenCalledWith("/recipes/tomato-soup");
    expect(router.back).not.toHaveBeenCalled();
  });

  it("explains how numeric and explicit yields are interpreted", () => {
    renderEditForm();

    expect(screen.getByRole("textbox", { name: "Yield" })).toHaveAttribute(
      "placeholder",
      "2 or Makes 24",
    );
    expect(
      screen.getByText(
        "Numbers default to “Serves”; you can also enter a complete “Makes” phrase.",
      ),
    ).toBeInTheDocument();
  });
});

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecipeGrid } from "../RecipeGrid";

const navigationState = vi.hoisted(() => ({ query: "" }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ toString: () => navigationState.query }),
}));

type FakeAnimation = {
  cancel: ReturnType<typeof vi.fn>;
  finished: Promise<void>;
};

describe("RecipeGrid motion", () => {
  const animate = vi.fn();
  const animations: FakeAnimation[] = [];
  let finishedFactory: () => Promise<void>;

  beforeEach(() => {
    navigationState.query = "";
    animate.mockReset();
    animations.length = 0;
    finishedFactory = () => Promise.resolve();
    animate.mockImplementation(() => {
      const animation = { cancel: vi.fn(), finished: finishedFactory() };
      animations.push(animation);
      return animation as unknown as Animation;
    });
    Object.defineProperty(HTMLElement.prototype, "animate", {
      configurable: true,
      value: animate,
    });
    vi.stubGlobal(
      "matchMedia",
      vi.fn((query: string) => ({
        addEventListener: vi.fn(),
        addListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === "(min-width: 700px)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
        removeListener: vi.fn(),
      })),
    );
  });

  afterEach(() => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("fades initial desktop cards upward in grid order", () => {
    render(
      <RecipeGrid>
        <article>First</article>
        <article>Second</article>
        <article>Third</article>
      </RecipeGrid>,
    );

    expect(animate).toHaveBeenCalledTimes(3);
    expect(animate).toHaveBeenNthCalledWith(
      1,
      [
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: 500,
        delay: 0,
        easing: "cubic-bezier(0, 0, 0.2, 1)",
        fill: "backwards",
      },
    );
    expect(animate.mock.calls[1][1]).toMatchObject({ delay: 110 });
    expect(animate.mock.calls[2][1]).toMatchObject({ delay: 220 });
  });

  it("fades the old grid out before fading the replacement grid in", async () => {
    const { rerender } = render(
      <RecipeGrid>
        <article key="old-1">Old one</article>
        <article key="old-2">Old two</article>
      </RecipeGrid>,
    );

    await act(async () => {
      navigationState.query = "tags=quick";
      rerender(
        <RecipeGrid>
          <article key="new-1">New one</article>
          <article key="new-2">New two</article>
        </RecipeGrid>,
      );
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(animate).toHaveBeenCalledTimes(6);
    expect(animate).toHaveBeenNthCalledWith(
      3,
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(14px)" },
      ],
      {
        duration: 320,
        delay: 0,
        easing: "cubic-bezier(0.4, 0, 1, 1)",
        fill: "forwards",
      },
    );
    expect(animate.mock.calls[3][1]).toMatchObject({ delay: 45 });
    expect(animate.mock.calls[4][0]).toEqual([
      { opacity: 0, transform: "translateY(20px)" },
      { opacity: 1, transform: "translateY(0)" },
    ]);
    expect(screen.getByText("New one")).toBeInTheDocument();
    expect(screen.queryByText("Old one")).not.toBeInTheDocument();
  });

  it("keeps the old cards mounted until their exit has completed", async () => {
    let finishExit = () => {};
    const exitFinished = new Promise<void>((resolve) => {
      finishExit = resolve;
    });

    const { rerender } = render(
      <RecipeGrid>
        <article>Old card</article>
      </RecipeGrid>,
    );
    finishedFactory = () => exitFinished;

    navigationState.query = "sort=alpha";
    rerender(
      <RecipeGrid>
        <article>New card</article>
      </RecipeGrid>,
    );

    expect(screen.getByText("Old card")).toBeInTheDocument();
    expect(screen.queryByText("New card")).not.toBeInTheDocument();

    finishedFactory = () => Promise.resolve();
    await act(async () => {
      finishExit();
      await exitFinished;
    });

    expect(screen.getByText("New card")).toBeInTheDocument();
  });

  it("cancels an in-flight fade before starting the next query transition", () => {
    const neverFinishes = new Promise<void>(() => {});
    const { rerender } = render(
      <RecipeGrid>
        <article>Recipe</article>
      </RecipeGrid>,
    );

    finishedFactory = () => neverFinishes;
    navigationState.query = "sort=alpha";
    rerender(
      <RecipeGrid>
        <article>Recipe</article>
      </RecipeGrid>,
    );
    const firstExit = animations.at(-1);

    navigationState.query = "sort=recent";
    rerender(
      <RecipeGrid>
        <article>Recipe</article>
      </RecipeGrid>,
    );

    expect(firstExit?.cancel).toHaveBeenCalledOnce();
    expect(animations.length).toBeGreaterThanOrEqual(3);
  });
});

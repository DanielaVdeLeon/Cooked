import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RecipeGrid } from "../RecipeGrid";

const navigationState = vi.hoisted(() => ({ query: "" }));

vi.mock("next/navigation", () => ({
  useSearchParams: () => ({ toString: () => navigationState.query }),
}));

const rect = (left: number, top: number): DOMRect =>
  ({
    bottom: top + 200,
    height: 200,
    left,
    right: left + 300,
    top,
    width: 300,
    x: left,
    y: top,
    toJSON: () => ({}),
  }) as DOMRect;

describe("RecipeGrid motion", () => {
  const animate = vi.fn();
  const animations: Array<{ cancel: ReturnType<typeof vi.fn> }> = [];

  beforeEach(() => {
    navigationState.query = "";
    animate.mockReset();
    animations.length = 0;
    animate.mockImplementation(() => {
      const animation = { cancel: vi.fn() };
      animations.push(animation);
      return animation;
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
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
      callback(0);
      return 1;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
  });

  afterEach(() => {
    delete (HTMLElement.prototype as Partial<HTMLElement>).animate;
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("re-deals desktop cards from the top-left pile when the query changes", () => {
    const { container, rerender } = render(
      <RecipeGrid>
        <article />
        <article />
        <article />
      </RecipeGrid>,
    );
    const cards = [...container.querySelectorAll("article")];
    vi.spyOn(cards[0], "getBoundingClientRect").mockReturnValue(rect(10, 20));
    vi.spyOn(cards[1], "getBoundingClientRect").mockReturnValue(rect(360, 20));
    vi.spyOn(cards[2], "getBoundingClientRect").mockReturnValue(rect(10, 420));

    expect(animate).not.toHaveBeenCalled();

    navigationState.query = "sort=alpha";
    rerender(
      <RecipeGrid>
        <article />
        <article />
        <article />
      </RecipeGrid>,
    );

    expect(animate).toHaveBeenCalledTimes(3);
    expect(animate).toHaveBeenNthCalledWith(
      1,
      [
        {
          transform: "translate(0px, 0px) rotate(-1.6deg) scale(0.975)",
          boxShadow: "0 2px 3px rgba(0, 0, 0, 0.28)",
        },
        {
          offset: 0.82,
          transform: "translate(0px, -12px) rotate(0.32deg) scale(1.006)",
          boxShadow: "0 10px 18px rgba(0, 0, 0, 0.18)",
        },
        {
          transform: "translate(0, 0) rotate(0deg) scale(1)",
          boxShadow: "0 4px 4px rgba(0, 0, 0, 0.25)",
        },
      ],
      {
        duration: 620,
        delay: 0,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        fill: "backwards",
      },
    );
    expect(animate.mock.calls[1][0][0].transform).toBe(
      "translate(-350px, 0px) rotate(0deg) scale(0.975)",
    );
    expect(animate.mock.calls[1][0][1].transform).toBe(
      "translate(-28px, -12px) rotate(0deg) scale(1.006)",
    );
    expect(animate.mock.calls[1][1]).toMatchObject({ delay: 28 });
    expect(animate.mock.calls[2][0][0].transform).toBe(
      "translate(0px, -400px) rotate(1.6deg) scale(0.975)",
    );
    expect(animate.mock.calls[2][0][1].transform).toBe(
      "translate(0px, -44px) rotate(-0.32deg) scale(1.006)",
    );
    expect(animate.mock.calls[2][1]).toMatchObject({ delay: 56 });
  });

  it("cancels an in-flight deal before starting the next one", () => {
    const { rerender } = render(
      <RecipeGrid>
        <article />
      </RecipeGrid>,
    );

    navigationState.query = "sort=alpha";
    rerender(
      <RecipeGrid>
        <article />
      </RecipeGrid>,
    );
    expect(animations).toHaveLength(1);

    navigationState.query = "sort=recent";
    rerender(
      <RecipeGrid>
        <article />
      </RecipeGrid>,
    );

    expect(animations[0].cancel).toHaveBeenCalledOnce();
    expect(animations).toHaveLength(2);
  });
});

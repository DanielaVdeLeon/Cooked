import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, act } from "@testing-library/react";
import { Button } from "../Button";
import { TagChip } from "../TagChip";
import { ConfirmDialog } from "../ConfirmDialog";
import { ToastProvider, useToast } from "../Toast";

describe("Button", () => {
  it("renders an accessible button and fires clicks", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);
    const button = screen.getByRole("button", { name: "Save" });
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire when disabled", () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe("TagChip", () => {
  it("renders as a button by default", () => {
    render(<TagChip aria-label="Show recipes tagged vegetarian">vegetarian</TagChip>);
    expect(
      screen.getByRole("button", { name: "Show recipes tagged vegetarian" }),
    ).toBeInTheDocument();
  });

  it("renders as an inert span with asSpan", () => {
    render(<TagChip asSpan>vegetarian</TagChip>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("vegetarian")).toBeInTheDocument();
  });
});

describe("ConfirmDialog", () => {
  const baseProps = {
    title: "Delete recipe?",
    message: "This cannot be undone.",
    confirmLabel: "Delete",
    danger: true,
  };

  it("renders nothing when closed", () => {
    render(
      <ConfirmDialog
        {...baseProps}
        open={false}
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("confirms and cancels via its buttons", () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog {...baseProps} open onConfirm={onConfirm} onCancel={onCancel} />,
    );
    expect(screen.getByRole("alertdialog", { name: "Delete recipe?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("cancels on Escape", () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog {...baseProps} open onConfirm={() => {}} onCancel={onCancel} />,
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

function ToastTrigger() {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast("Recipe saved", "success")}>trigger</button>
  );
}

describe("Toast", () => {
  it("shows a toast with role=status and hides it after 2.6s", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText("trigger"));
    expect(screen.getByRole("status")).toHaveTextContent("Recipe saved");
    act(() => {
      vi.advanceTimersByTime(2700);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});

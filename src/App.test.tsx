import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";
import { DEFAULT_BOARDS } from "./constants";

function getBoardRegions() {
  return screen.getAllByRole("region").filter(
    (region) => region.getAttribute("aria-label") !== "Task filters",
  );
}

function boardNameOf(region: HTMLElement) {
  return region.getAttribute("aria-label") ?? "";
}

function createDataTransfer() {
  const store: Record<string, string> = {};

  return {
    dropEffect: "move",
    effectAllowed: "all",
    files: [] as File[],
    items: [] as DataTransferItem[],
    types: [] as string[],
    setData(format: string, value: string) {
      store[format] = value;
      if (!this.types.includes(format)) {
        this.types.push(format);
      }
    },
    getData(format: string) {
      return store[format] ?? "";
    },
    clearData() {
      Object.keys(store).forEach((key) => {
        delete store[key];
      });
    },
    setDragImage() {},
  };
}

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("filters the board by priority", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("combobox", { name: "Priority" }));
    await user.click(screen.getByRole("option", { name: "Low" }));

    expect(screen.getByText("Update onboarding README")).toBeInTheDocument();
    expect(screen.getByText("Verify due date sorting")).toBeInTheDocument();
    expect(screen.queryByText("Write API contract")).not.toBeInTheDocument();
    expect(screen.queryByText("Fix login token expiry")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing matches the filters", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("Search"), "zzzz-no-match");

    expect(screen.queryByText("Write API contract")).not.toBeInTheDocument();
    expect(screen.getAllByText("No tasks in this column")).toHaveLength(
      DEFAULT_BOARDS.length,
    );
  });

  it("deletes a task and restores it from the toast", async () => {
    const user = userEvent.setup();
    render(<App />);

    const card = screen.getByRole("heading", {
      name: "Write API contract",
    }).closest("article");

    expect(card).not.toBeNull();
    await user.click(within(card as HTMLElement).getByRole("button", { name: "Delete" }));

    expect(
      screen.queryByRole("heading", { name: "Write API contract" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/Deleted “Write API contract”/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(
      screen.getByRole("heading", { name: "Write API contract" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Restored “Write API contract”/)).toBeInTheDocument();
  });

  it("shows a tooltip when hovering an action icon", async () => {
    const user = userEvent.setup();
    render(<App />);

    const card = screen.getByRole("heading", {
      name: "Write API contract",
    }).closest("article");

    await user.hover(within(card as HTMLElement).getByRole("button", { name: "Delete" }));

    expect(screen.getByRole("tooltip", { name: "Delete" })).toBeInTheDocument();
  });

  it("duplicates a task", async () => {
    const user = userEvent.setup();
    render(<App />);

    const card = screen.getByRole("heading", {
      name: "Write API contract",
    }).closest("article");

    await user.click(
      within(card as HTMLElement).getByRole("button", { name: "Duplicate" }),
    );

    expect(screen.getByText("Write API contract (copy)")).toBeInTheDocument();
    expect(screen.getByText(/Duplicated “Write API contract”/)).toBeInTheDocument();
  });

  it("moves a task to another column without changing completion", () => {
    render(<App />);

    const card = screen.getByRole("heading", {
      name: "Write API contract",
    }).closest("article");
    const targetBoard = getBoardRegions()[1];
    const targetName = boardNameOf(targetBoard);
    const dataTransfer = createDataTransfer();

    expect(card).not.toBeNull();
    fireEvent.dragStart(card as HTMLElement, { dataTransfer });
    fireEvent.dragEnter(targetBoard, { dataTransfer });
    fireEvent.dragOver(targetBoard, { dataTransfer });
    fireEvent.drop(targetBoard, { dataTransfer });
    fireEvent.dragEnd(card as HTMLElement, { dataTransfer });

    const movedCard = within(targetBoard)
      .getByRole("heading", { name: "Write API contract" })
      .closest("article");

    expect(movedCard).not.toBeNull();
    expect(
      screen.getByText(`Moved “Write API contract” to ${targetName}`),
    ).toBeInTheDocument();
    expect(
      within(movedCard as HTMLElement).getByRole("button", {
        name: "Mark completed",
      }),
    ).toBeInTheDocument();
  });

  it("marks a task completed in place and can hide it", async () => {
    const user = userEvent.setup();
    render(<App />);

    const card = screen.getByRole("heading", {
      name: "Write API contract",
    }).closest("article");
    const sourceBoard = getBoardRegions().find((region) =>
      card ? region.contains(card) : false,
    );

    expect(card).not.toBeNull();
    expect(sourceBoard).toBeDefined();
    await user.click(
      within(card as HTMLElement).getByRole("button", { name: "Mark completed" }),
    );

    expect(
      within(sourceBoard as HTMLElement).getByRole("heading", {
        name: "Write API contract",
      }),
    ).toBeInTheDocument();
    expect(card).toHaveClass("is-completed");
    expect(within(card as HTMLElement).getByText(/Completed on/)).toBeInTheDocument();
    expect(
      within(card as HTMLElement).getByRole("button", { name: "Mark incomplete" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: "Hide completed" }));

    expect(
      screen.queryByRole("heading", { name: "Write API contract" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Update onboarding README" }),
    ).not.toBeInTheDocument();
  });

  it("renames an existing board", async () => {
    const user = userEvent.setup();
    render(<App />);

    const originalName = boardNameOf(getBoardRegions()[0]);
    await user.click(
      screen.getByRole("button", { name: `Rename ${originalName}` }),
    );

    const nameInput = screen.getByRole("textbox", { name: "Board name" });
    const nextName = `${originalName} renamed`;
    await user.clear(nameInput);
    await user.type(nameInput, nextName);
    await user.keyboard("{Enter}");

    expect(screen.getByRole("region", { name: nextName })).toBeInTheDocument();
    expect(screen.getByText(`Renamed board to “${nextName}”`)).toBeInTheDocument();
  });

  it("creates a custom board and keeps it after rename", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Add board" }));

    const nameInput = screen.getByRole("textbox", { name: "Board name" });
    const customName = "Custom board";
    await user.clear(nameInput);
    await user.type(nameInput, customName);
    await user.keyboard("{Enter}");

    expect(screen.getByRole("region", { name: customName })).toBeInTheDocument();
    expect(
      screen.getByText(`Renamed board to “${customName}”`),
    ).toBeInTheDocument();
  });

  it("only allows deleting an empty board", async () => {
    const user = userEvent.setup();
    render(<App />);

    const occupiedName = boardNameOf(getBoardRegions()[0]);
    await user.click(
      screen.getByRole("button", { name: `Delete ${occupiedName}` }),
    );

    expect(
      screen.getByRole("region", { name: occupiedName }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        `“${occupiedName}” must be empty before it can be deleted.`,
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add board" }));
    const nameInput = screen.getByRole("textbox", { name: "Board name" });
    const emptyName = (nameInput as HTMLInputElement).value;
    await user.keyboard("{Enter}");

    await user.click(screen.getByRole("button", { name: `Delete ${emptyName}` }));

    expect(
      screen.queryByRole("region", { name: emptyName }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(`Deleted “${emptyName}”`)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(screen.getByRole("region", { name: emptyName })).toBeInTheDocument();
    expect(screen.getByText(`Restored “${emptyName}”`)).toBeInTheDocument();
  });

  it("switches to a sortable list view", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "List" }));

    expect(screen.getByRole("table")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /sort by title/i }));

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Accessibility pass on modal");
  });
});

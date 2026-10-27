import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import App from "./App";

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

    expect(
      screen.getByText("No tasks match these filters"),
    ).toBeInTheDocument();
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

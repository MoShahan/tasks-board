import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { demoBoards } from "../data/demoTasks";

import TaskModal from "./TaskModal";

describe("TaskModal", () => {
  it("blocks submit when the title is empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <TaskModal boards={demoBoards} onClose={onClose} onSubmit={onSubmit} />,
    );

    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Title is required.");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits a valid new task", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <TaskModal boards={demoBoards} onClose={vi.fn()} onSubmit={onSubmit} />,
    );

    await user.type(screen.getByLabelText("Title"), "Ship dark theme");
    await user.type(
      screen.getByLabelText("Description"),
      "Polish the board for the walkthrough.",
    );
    await user.click(screen.getByRole("combobox", { name: "Board" }));
    await user.click(screen.getByRole("option", { name: demoBoards[0].name }));
    await user.click(screen.getByRole("combobox", { name: "Priority" }));
    await user.click(screen.getByRole("option", { name: "High" }));
    await user.click(screen.getByRole("button", { name: "Create task" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      title: "Ship dark theme",
      description: "Polish the board for the walkthrough.",
      boardId: demoBoards[0].id,
      status: "open",
      priority: "high",
    });
  });
});

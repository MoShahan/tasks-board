import { useEffect, useState } from "react";

import { STORAGE_KEY } from "../constants";
import { demoBoards, demoTasks } from "../data/demoTasks";
import type { Board, Task, TaskDraft } from "../types";
import {
  addBoard,
  deleteBoard,
  insertBoard,
  moveBoard,
  nextBoardName,
  renameBoard,
} from "../utils/boards";
import {
  addTask,
  completeTask,
  deleteTask,
  deserializeStore,
  duplicateTask,
  insertTask,
  serializeStore,
  uncompleteTask,
  updateTask,
} from "../utils/tasks";

type StoreState = {
  boards: Board[];
  tasks: Task[];
};

function loadStore(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { boards: demoBoards, tasks: demoTasks };
    }

    return deserializeStore(raw) ?? { boards: demoBoards, tasks: demoTasks };
  } catch {
    return { boards: demoBoards, tasks: demoTasks };
  }
}

export function useTaskStore() {
  const [state, setState] = useState<StoreState>(loadStore);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, serializeStore(state.boards, state.tasks));
  }, [state]);

  const create = (draft: TaskDraft) => {
    setState((current) => ({
      ...current,
      tasks: addTask(current.tasks, draft),
    }));
  };

  const update = (taskId: string, updates: Partial<TaskDraft>) => {
    setState((current) => ({
      ...current,
      tasks: updateTask(current.tasks, taskId, updates),
    }));
  };

  const complete = (taskId: string) => {
    setState((current) => ({
      ...current,
      tasks: completeTask(current.tasks, taskId),
    }));
  };

  const uncomplete = (taskId: string) => {
    setState((current) => ({
      ...current,
      tasks: uncompleteTask(current.tasks, taskId),
    }));
  };

  const remove = (taskId: string) => {
    setState((current) => ({
      ...current,
      tasks: deleteTask(current.tasks, taskId),
    }));
  };

  const duplicate = (taskId: string) => {
    setState((current) => ({
      ...current,
      tasks: duplicateTask(current.tasks, taskId),
    }));
  };

  const restore = (task: Task, index: number) => {
    setState((current) => ({
      ...current,
      tasks: insertTask(current.tasks, task, index),
    }));
  };

  const createBoard = (name?: string) => {
    const id = crypto.randomUUID();
    setState((current) => ({
      ...current,
      boards: addBoard(
        current.boards,
        name ?? nextBoardName(current.boards),
        id,
      ),
    }));
    return id;
  };

  const updateBoard = (boardId: string, name: string) => {
    setState((current) => ({
      ...current,
      boards: renameBoard(current.boards, boardId, name),
    }));
  };

  const removeBoard = (boardId: string) => {
    setState((current) => deleteBoard(current.boards, current.tasks, boardId) ?? current);
  };

  const restoreBoard = (board: Board, index: number) => {
    setState((current) => ({
      ...current,
      boards: insertBoard(current.boards, board, index),
    }));
  };

  const reorderBoards = (
    boardId: string,
    targetBoardId: string,
    place: "before" | "after",
  ) => {
    setState((current) => ({
      ...current,
      boards: moveBoard(current.boards, boardId, targetBoardId, place),
    }));
  };

  return {
    boards: state.boards,
    tasks: state.tasks,
    create,
    update,
    complete,
    uncomplete,
    remove,
    duplicate,
    restore,
    createBoard,
    updateBoard,
    removeBoard,
    restoreBoard,
    reorderBoards,
  };
}

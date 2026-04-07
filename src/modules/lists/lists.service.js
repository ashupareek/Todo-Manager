import crypto from "node:crypto";
import { todoLists, todos } from "../../store/in-memory.store.js";

export function getAllLists() {
  return todoLists.map((list) => ({
    ...list,
    todos: todos.filter((todo) => todo.listId === list.id),
  }));
}

export function createList({ name, creatorId }) {
  if (!name) {
    return {
      status: 400,
      body: { message: "List name is required" },
    };
  }

  const newList = {
    id: crypto.randomUUID(),
    name,
    creatorId,
  };

  todoLists.push(newList);

  return {
    status: 201,
    body: newList,
  };
}

export function updateList({ listId, name, userId }) {
  const list = todoLists.find((item) => item.id === listId);

  if (!list) {
    return {
      status: 404,
      body: { message: "List not found" },
    };
  }

  if (list.creatorId !== userId) {
    return {
      status: 403,
      body: { message: "Forbidden: only owner can update this list" },
    };
  }

  if (!name) {
    return {
      status: 400,
      body: { message: "New list name is required" },
    };
  }

  list.name = name;

  return {
    status: 200,
    body: {
      message: "List updated successfully",
      list,
    },
  };
}

export function createTodo({ listId, task, userId }) {
  const list = todoLists.find((item) => item.id === listId);

  if (!list) {
    return {
      status: 404,
      body: { message: "List not found" },
    };
  }

  if (list.creatorId !== userId) {
    return {
      status: 403,
      body: { message: "Forbidden: only owner can add todos to this list" },
    };
  }

  if (!task) {
    return {
      status: 400,
      body: { message: "Task is required" },
    };
  }

  const newTodo = {
    id: crypto.randomUUID(),
    task,
    completed: false,
    listId: list.id,
  };

  todos.push(newTodo);

  return {
    status: 201,
    body: newTodo,
  };
}

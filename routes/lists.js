import express from "express";
import crypto from "node:crypto";

const router = express.Router();

const todoLists = [];
const todos = [];

// GET /lists
// any logged-in user can view all lists
router.get("/", (req, res) => {
  const listsWithTodos = todoLists.map((list) => {
    const listTodos = todos.filter((todo) => todo.listId === list.id);

    return {
      ...list,
      todos: listTodos,
    };
  });

  res.status(200).json(listsWithTodos);
});

// POST /lists
// creatorId must come from JWT
router.post("/", (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "List name is required" });
  }

  const newList = {
    id: crypto.randomUUID(),
    name,
    creatorId: req.user.userId,
  };

  todoLists.push(newList);

  res.status(201).json(newList);
});

// PATCH /lists/:id
// only owner can update list name
router.patch("/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const list = todoLists.find((list) => list.id === id);

  if (!list) {
    return res.status(404).json({ message: "List not found" });
  }

  if (list.creatorId !== req.user.userId) {
    return res
      .status(403)
      .json({ message: "Forbidden: only owner can update this list" });
  }

  if (!name) {
    return res.status(400).json({ message: "New list name is required" });
  }

  list.name = name;

  res.status(200).json({
    message: "List updated successfully",
    list,
  });
});

// POST /lists/:id/todos
// only owner can add todo to the list
router.post("/:id/todos", (req, res) => {
  const { id } = req.params;
  const { task } = req.body;

  const list = todoLists.find((list) => list.id === id);

  if (!list) {
    return res.status(404).json({ message: "List not found" });
  }

  if (list.creatorId !== req.user.userId) {
    return res
      .status(403)
      .json({ message: "Forbidden: only owner can add todos to this list" });
  }

  if (!task) {
    return res.status(400).json({ message: "Task is required" });
  }

  const newTodo = {
    id: crypto.randomUUID(),
    task,
    completed: false,
    listId: list.id,
  };

  todos.push(newTodo);

  res.status(201).json(newTodo);
});

export default router;
import {
  createList,
  createTodo,
  getAllLists,
  updateList,
} from "./lists.service.js";

export function getLists(req, res) {
  res.status(200).json(getAllLists());
}

export function postList(req, res) {
  const result = createList({
    name: req.body.name,
    creatorId: req.user.userId,
  });

  res.status(result.status).json(result.body);
}

export function patchList(req, res) {
  const result = updateList({
    listId: req.params.id,
    name: req.body.name,
    userId: req.user.userId,
  });

  res.status(result.status).json(result.body);
}

export function postTodo(req, res) {
  const result = createTodo({
    listId: req.params.id,
    task: req.body.task,
    userId: req.user.userId,
  });

  res.status(result.status).json(result.body);
}

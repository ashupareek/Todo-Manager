import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { requestLogger } from "../../middleware/request-logger.middleware.js";
import { getLists, patchList, postList, postTodo } from "./lists.controller.js";

const listsRouter = Router();

listsRouter.use(requestLogger, authMiddleware);

listsRouter.get("/", getLists);
listsRouter.post("/", postList);
listsRouter.patch("/:id", patchList);
listsRouter.post("/:id/todos", postTodo);

export default listsRouter;

import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getCurrentUser, login, signup } from "./auth.controller.js";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", authMiddleware, getCurrentUser);

export default authRouter;

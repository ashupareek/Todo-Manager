import { Router } from "express";
import authRouter from "../modules/auth/auth.routes.js";
import healthRouter from "../modules/health/health.routes.js";
import listsRouter from "../modules/lists/lists.routes.js";

const apiRouter = Router();

apiRouter.use("/", healthRouter);
apiRouter.use(authRouter);
apiRouter.use("/lists", listsRouter);

export default apiRouter;

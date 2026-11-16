import { Router, type IRouter } from "express";
import healthRouter from "./health";
import farmRouter from "./farm";
import montagesRouter from "./montages";
import imagesRouter from "./images";

const router: IRouter = Router();

router.use(healthRouter);
router.use(farmRouter);
router.use(montagesRouter);
router.use(imagesRouter);

export default router;

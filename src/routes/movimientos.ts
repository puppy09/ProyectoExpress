import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { getMovimientos } from "../controllers/movimientos";
const router = Router();

router.get('/',checkJwt, getMovimientos);

export {router};

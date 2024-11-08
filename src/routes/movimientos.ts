import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { getMovimientos, getMovimientosProgramados } from "../controllers/movimientos";
const router = Router();

router.get('/',checkJwt, getMovimientos);
router.get('/programados',checkJwt, getMovimientosProgramados);
export {router};

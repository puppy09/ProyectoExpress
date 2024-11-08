import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { getMovByCuenta, getMovimientos, getMovimientosProgramados } from "../controllers/movimientos";
const router = Router();

router.get('/',checkJwt, getMovimientos);
router.get('/programados',checkJwt, getMovimientosProgramados);
router.get('/by/cuenta', checkJwt, getMovByCuenta);
export {router};

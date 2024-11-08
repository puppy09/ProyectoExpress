import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { getMovByCuenta, getMovimientos, getMovimientosProgramados, postFondos, postFondosProgramados } from "../controllers/movimientos";
const router = Router();

router.get('/',checkJwt, getMovimientos);
router.get('/programados',checkJwt, getMovimientosProgramados);
router.post('/by/cuenta/', checkJwt, getMovByCuenta);
router.post('/', checkJwt, postFondos);
router.post('/programados', checkJwt, postFondosProgramados);
export {router};

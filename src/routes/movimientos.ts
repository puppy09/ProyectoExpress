import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { activarMovProgramado, desactivarMovProgramado, getMovByCuenta, getMovimientos, getMovimientosProgramados, postFondos, postFondosProgramados } from "../controllers/movimientos";
const router = Router();

router.get('/',checkJwt, getMovimientos);
router.get('/programados',checkJwt, getMovimientosProgramados);
router.post('/by/cuenta/', checkJwt, getMovByCuenta);
router.post('/', checkJwt, postFondos);
router.post('/programados', checkJwt, postFondosProgramados);
router.patch('/programados/activar/:movPro',checkJwt,activarMovProgramado);
router.patch('/programados/desactivar/:movPro',checkJwt,desactivarMovProgramado);

export {router};

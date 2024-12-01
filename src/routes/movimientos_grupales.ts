import { Router } from "express";
import { checkJwt } from "../middleware/session";

import { activarMovProgramado, addFondos, addFondosProgramados, desactivarMovProgramado, getMovimientosGrupales, getMovimientosProgramadosGrupales, uptFondosProGru } from "../controllers/movimientosGrupos";
const router = Router();

router.post('/add/:grupo',checkJwt, addFondos);
router.post('/add/programados/:grupo',checkJwt, addFondosProgramados);
router.get('/:grupo',checkJwt, getMovimientosGrupales);
router.get('/programados/:grupo',checkJwt, getMovimientosProgramadosGrupales);
router.put('/update/:movProId',checkJwt,uptFondosProGru);
router.patch('/desactivar/:movPro',checkJwt, desactivarMovProgramado);
router.patch('/activar/:movPro',checkJwt, activarMovProgramado);
export {router};

import { Router } from "express";
import { checkJwt } from "../middleware/session";

import { addFondos, getMovimientosGrupales, uptFondosProGru } from "../controllers/movimientosGrupos";
const router = Router();

router.post('/add/:grupo',checkJwt, addFondos);
router.get('/:grupo',checkJwt, getMovimientosGrupales);
router.put('/update/:grupo',checkJwt,uptFondosProGru);

export {router};

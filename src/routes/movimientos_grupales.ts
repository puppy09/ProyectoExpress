import { Router } from "express";
import { checkJwt } from "../middleware/session";

import { addFondos, uptFondosProGru } from "../controllers/movimientosGrupos";
const router = Router();

router.post('/add/:grupo',checkJwt, addFondos);
router.put('/update/:grupo',checkJwt,uptFondosProGru);

export {router};

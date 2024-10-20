import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { addFondos } from "../controllers/movimientosGrupos";
const router = Router();

router.post('/add/:grupo',checkJwt, addFondos);

export {router};

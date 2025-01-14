import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { getGruposCreados, getGruposMiembro, joinGrupo, postGrupos, updateGrupo } from "../controllers/grupos";
import { getFondos } from "../controllers/movimientosGrupos";

const router = Router();

router.post('/', checkJwt, postGrupos);
router.get('/creados',checkJwt, getGruposCreados);
router.get('/miembro',checkJwt, getGruposMiembro);
router.get('/fondos/:grupo',checkJwt,getFondos);
router.post('/unirse', checkJwt, joinGrupo);
router.put('/:grupo', checkJwt, updateGrupo);

export{router};
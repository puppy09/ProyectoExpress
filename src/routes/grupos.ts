import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { getGruposCreados, getGruposMiembro, joinGrupo, postGrupos, updateGrupo } from "../controllers/grupos";

const router = Router();

router.post('/', checkJwt, postGrupos);
router.get('/creados',checkJwt, getGruposCreados);
router.get('/miembro',checkJwt, getGruposMiembro);
router.post('/unirse', checkJwt, joinGrupo);
router.put('/:grupo', checkJwt, updateGrupo);

export{router};
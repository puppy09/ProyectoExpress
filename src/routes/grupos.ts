import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { getGruposCreados, getGruposMiembro, postGrupos } from "../controllers/grupos";

const router = Router();

router.post('/', checkJwt, postGrupos);
router.get('/creados',checkJwt, getGruposCreados);
router.get('/miembro',checkJwt, getGruposMiembro);

export{router};
import { Router } from "express";
import { checkConnection } from "../config/database";
import { checkJwt } from "../middleware/session";
import { getMiembros } from "../controllers/miembrosGrupos";
const router = Router();

router.get('/:grupo', checkJwt, getMiembros);

export{router};
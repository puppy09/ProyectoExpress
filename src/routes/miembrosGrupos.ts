import { Router } from "express";
import { checkConnection } from "../config/database";
import { checkJwt } from "../middleware/session";
import { activarUser, adminActivarUser, adminDesactivarUser, desactivarUser, getMiembros } from "../controllers/miembrosGrupos";
const router = Router();

router.patch('/desactivar', checkJwt, desactivarUser);
router.patch('/activar',checkJwt, activarUser);
router.patch('/admin/activar',checkJwt, adminActivarUser);
router.patch('/admin/desactivar',checkJwt, adminDesactivarUser);
router.get('/:grupo', checkJwt, getMiembros);

export{router};
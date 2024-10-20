import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { addCategoria, getCategorias } from "../controllers/categoriasGrupos";
const router = Router();

router.post('/:grupo',checkJwt, addCategoria);
router.get('/:grupo',checkJwt, getCategorias);

export {router};

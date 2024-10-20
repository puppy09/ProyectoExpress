import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { addSubcategoria, getSubcategorias } from "../controllers/subcategoriasGrupos";

const router = Router();

router.post('/:grupo', checkJwt, addSubcategoria);
router.get('/:grupo', checkJwt, getSubcategorias)
export{router};
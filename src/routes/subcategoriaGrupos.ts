import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { addSubcategoria, getSubcategorias, getSubcategoriasByCat } from "../controllers/subcategoriasGrupos";

const router = Router();

router.post('/:grupo', checkJwt, addSubcategoria);
router.get('/:grupo', checkJwt, getSubcategorias)
router.get('/categoria/:id_categoria',checkJwt, getSubcategoriasByCat);
export{router};
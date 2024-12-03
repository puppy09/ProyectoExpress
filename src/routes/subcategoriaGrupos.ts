import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { addSubcategoria, deleteSubcategory, getSubcategorias, getSubcategoriasByCat, postAndAssignGrupos } from "../controllers/subcategoriasGrupos";

const router = Router();

router.post('/:grupo', checkJwt, addSubcategoria);
router.get('/:grupo', checkJwt, getSubcategorias)
router.get('/grupo/:grupo/categoria/:id_categoria',checkJwt, getSubcategoriasByCat);
router.post('post/and/asign',checkJwt,postAndAssignGrupos);
router.delete('/delete',checkJwt,deleteSubcategory);
export{router};
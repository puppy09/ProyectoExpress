import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { addCategoria, deshabilitarCat, getBudgetSpentGrupal, getCategorias, getGlobalActCat, habilitarCat, updateGloCat } from "../controllers/categoriasGrupos";
import { getBudgetSpent } from "../controllers/category";
const router = Router();

router.get('/activas/:grupo',checkJwt, getGlobalActCat);
router.put('/update/:categoria',checkJwt,updateGloCat);
router.put('/gastado/:grupo',checkJwt, getBudgetSpentGrupal);
router.post('/:grupo',checkJwt, addCategoria);
router.get('/:grupo',checkJwt, getCategorias);
router.patch('/activar/:categoria', checkJwt, habilitarCat);
router.patch('/desactivar/:categoria',checkJwt,deshabilitarCat);


export {router};

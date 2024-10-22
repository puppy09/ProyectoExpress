import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { addCategoria, deshabilitarCat, getCategorias, getGlobalActCat, habilitarCat, updateGloCat } from "../controllers/categoriasGrupos";
const router = Router();

router.get('/activas',checkJwt, getGlobalActCat);
router.put('/update/:categoria',checkJwt,updateGloCat);
router.post('/:grupo',checkJwt, addCategoria);
router.get('/:grupo',checkJwt, getCategorias);
router.patch('/activar/:categoria', checkJwt, habilitarCat);
router.patch('/desactivar/:categoria',checkJwt,deshabilitarCat);


export {router};

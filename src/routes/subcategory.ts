import {Router} from 'express';
import { checkJwt } from "../middleware/session";
import { asignarSubcategoria, deleteSubcategory, getSubByCat, getSingleSubcategorias, getSubcategorias, postAndAssign } from '../controllers/subcategory';
const router = Router();


router.post('/',checkJwt, asignarSubcategoria);
router.post('/delete', checkJwt, deleteSubcategory);
router.post('/create/assign',checkJwt, postAndAssign);
router.get('/:catId',checkJwt, getSubByCat);
router.get('/', checkJwt, getSubcategorias);

router.get('/:id_categoria',checkJwt, getSingleSubcategorias);
//router.post('/delete', checkJwt, deleteSubcategory);

export { router };
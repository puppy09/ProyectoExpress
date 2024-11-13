import {Router} from 'express';
import { checkJwt } from "../middleware/session";
import { asignarSubcategoria, deleteSubcategory, getSubByCat, getSingleSubcategorias, getSubcategorias } from '../controllers/subcategory';
const router = Router();

router.post('/',checkJwt, asignarSubcategoria);
router.get('/:catId',checkJwt, getSubByCat);
router.get('/', checkJwt, getSubcategorias);

router.get('/:id_categoria',checkJwt, getSingleSubcategorias);
router.delete('/', checkJwt, deleteSubcategory);

export { router };
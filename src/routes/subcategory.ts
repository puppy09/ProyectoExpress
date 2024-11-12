import {Router} from 'express';
import { checkJwt } from "../middleware/session";
import { asignarSubcategoria, deleteSubcategory, getCatBySub, getSingleSubcategorias, getSubcategorias } from '../controllers/subcategory';
const router = Router();

router.post('/',checkJwt, asignarSubcategoria);
router.get('/', checkJwt, getSubcategorias);
router.get('/:catId',checkJwt, getCatBySub);
router.get('/:id_categoria',checkJwt, getSingleSubcategorias);
router.delete('/', checkJwt, deleteSubcategory);

export { router };
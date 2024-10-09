import {Router} from 'express';
import { checkJwt } from "../middleware/session";
import { getAllNegocios, getNegociosByCategory, postNegocio } from '../controllers/negocios';
const router = Router();

router.post('/', checkJwt,postNegocio);
router.get('/', checkJwt, getAllNegocios);
router.get('/:categoryId', checkJwt, getNegociosByCategory);

export { router };

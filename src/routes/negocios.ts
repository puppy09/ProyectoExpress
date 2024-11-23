import {Router} from 'express';
import { checkJwt } from "../middleware/session";
import { getAllNegocios, getNegociosByRubro, getRubros, postNegocio } from '../controllers/negocios';
const router = Router();

router.post('/', checkJwt,postNegocio);
router.get('/', checkJwt, getAllNegocios);
router.get('/rubros',checkJwt,getRubros);
router.get('/:categoryId', checkJwt, getNegociosByRubro);
 

export { router };

import {Router} from 'express';
import { deletePago, getPagos, getPagosCategory, getSinglePago, postPago, updatePago } from '../controllers/pagos';
import { checkJwt } from "../middleware/session";
const router = Router();

router.post('/', checkJwt,postPago);
router.put('/:pagoId',checkJwt, updatePago);
router.delete('/:pagoId',checkJwt, deletePago);
router.get('/', checkJwt, getPagos);
router.get('/:pagoId', checkJwt, getSinglePago);
router.get('/categorias/:categoryId', checkJwt, getPagosCategory);
/*router.get('/',checkJwt, getCategory);
router.put('/:category_id', checkJwt,updateCategory);
router.delete('/:category_id',checkJwt,deleteCategory);
router.patch('/:category_id',checkJwt,activarCategory);*/

export { router };

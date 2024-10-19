import {Router} from 'express';
import { getPagos, getPagosCategory, getPagosCatSub, getPagosProgramados, getPagosSubcategory, getSinglePago, postPago, reemboslarPago, updatePago, updatePagoProgramado } from '../controllers/pagos';
import { checkJwt } from "../middleware/session";
const router = Router();

router.post('/', checkJwt,postPago);
router.put('/update/:pagoId',checkJwt, updatePago);
router.put('/update/programado/:pagoProgramadoId', checkJwt, updatePagoProgramado);
//router.delete('/:pagoId',checkJwt, deletePago);
router.get('/', checkJwt, getPagos);
router.get('/programados',checkJwt,getPagosProgramados);
router.get('/:pagoId', checkJwt, getSinglePago);
router.get('/categorias/:categoryId', checkJwt, getPagosCategory);
router.get('/subcategorias/:subcategoryId',checkJwt, getPagosSubcategory);
router.get('/categorias/:categoryId/subcategorias/:subcategoryId',checkJwt,getPagosCatSub);
router.patch('/reembolsar/:id_pago', checkJwt, reemboslarPago);
/*router.get('/',checkJwt, getCategory);
router.put('/:category_id', checkJwt,updateCategory);
router.delete('/:category_id',checkJwt,deleteCategory);
router.patch('/:category_id',checkJwt,activarCategory);*/

export { router };

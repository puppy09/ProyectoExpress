import {Router} from 'express';
import { getPagos, getPagosByCuenta, getPagosCategory, getPagosCatSub, getPagosProgramados, getPagosSubcategory, getSinglePago, getTotalGastado, postPago, postPagoProgramado, reemboslarPago, updatePago, updatePagoProgramado } from '../controllers/pagos';
import { checkJwt } from "../middleware/session";
const router = Router();

router.post('/', checkJwt,postPago);
router.post('/programado',checkJwt,postPagoProgramado);
router.put('/update/:pagoId',checkJwt, updatePago);
router.put('/programado/update/:pagoProgramadoId', checkJwt, updatePagoProgramado);
router.get('/', checkJwt, getPagos);
router.get('/gastado',checkJwt, getTotalGastado);
router.get('/programado',checkJwt,getPagosProgramados);
router.get('/:pagoId', checkJwt, getSinglePago);
router.get('/by/categorias/:categoryId', checkJwt, getPagosCategory);
router.get('/by/subcategorias/:subcategoryId',checkJwt, getPagosSubcategory);
router.get('/by/categorias/:categoryId/subcategorias/:subcategoryId',checkJwt,getPagosCatSub);
router.post('/by/cuenta/', checkJwt, getPagosByCuenta);
router.patch('/reembolsar/:id_pago', checkJwt, reemboslarPago);

export { router };

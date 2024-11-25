import { Router } from "express";
import { checkJwt } from "../middleware/session";
import { addPagoGrupal, addPagoProgramadoGrupal, getPagosGrupales, getPagosGrupalesByCatandSub, getPagosGrupalesByCategory, getPagosGrupalesBySubcategory, getPagosProgramados, reembolsoGrupal, updatePagoGrupal } from "../controllers/pagosGrupos";
import { updPagoGruProgramado } from "../controllers/pagosGrupos";
const router = Router();

router.post('/:grupo', checkJwt, addPagoGrupal);
router.post('/programado/:grupo',checkJwt, addPagoProgramadoGrupal);
router.get('/:grupo', checkJwt, getPagosGrupales);
router.get('/programados/:grupo',checkJwt, getPagosProgramados);
router.get('/filtrar/categoria/:grupo', checkJwt, getPagosGrupalesByCategory);
router.get('/filtrar/subcategoria/:grupo', checkJwt, getPagosGrupalesBySubcategory);
router.get('/filtrar/:grupo',checkJwt, getPagosGrupalesByCatandSub);
router.put('/update/:pagoProgramadoId',checkJwt, updPagoGruProgramado);
router.put('/:pagoId', checkJwt, updatePagoGrupal);
router.post('/reembolsar/:pagoId', checkJwt, reembolsoGrupal);
router.post('/grupo')

export{router}
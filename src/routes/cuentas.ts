import { Router } from "express";
import{getCuentas, postCuenta, updateCuentas, addFunds, habilitarCuenta, deshabilitarCuenta, } from "../controllers/cuentas";
import { checkJwt } from "../middleware/session";

const router = Router();

router.post('/',checkJwt, postCuenta);
router.get('/', checkJwt, getCuentas);
router.post('/add',checkJwt,addFunds);
//router.delete('/:cuenta_id',checkJwt, deleteCuentas);
router.put('/:cuenta_id',checkJwt, updateCuentas);

router.patch('/activar/:cuenta_id', checkJwt, habilitarCuenta);
router.patch('/desactivar/:cuenta_id',checkJwt, deshabilitarCuenta);


export{router};
import { Router } from "express";
import{getCuentas, postCuenta, updateCuentas, habilitarCuenta, deshabilitarCuenta, getCuentasActivas, gettotalCuentas, } from "../controllers/cuentas";
import { checkJwt } from "../middleware/session";

const router = Router();

router.post('/',checkJwt, postCuenta);
router.get('/', checkJwt, getCuentas);
router.get('/activas',checkJwt, getCuentasActivas);
router.get('/sumatoria',checkJwt,gettotalCuentas)
//outer.post('/add',checkJwt,addFunds);
//router.post('/update/:idMov',checkJwt, updFondosProgra);
//router.delete('/:cuenta_id',checkJwt, deleteCuentas);
router.put('/:cuenta_id',checkJwt, updateCuentas);

router.patch('/activar/:cuenta_id', checkJwt, habilitarCuenta);
router.patch('/desactivar/:cuenta_id',checkJwt, deshabilitarCuenta);


export{router};
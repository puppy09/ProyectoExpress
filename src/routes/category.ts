import {Router} from 'express';
import {activarCategory, desactivarCategory, getActivaCategories, getBudgetSpent, getCategory, getSingleCategory, getTotalBudget, getTotalSpent, postCategory, updateCategory} from '../controllers/category'
import { checkJwt } from "../middleware/session";
const router = Router();

router.post('/', checkJwt,postCategory);
router.get('/',checkJwt, getCategory);
router.get('/totalBudget',checkJwt,getTotalBudget);
router.get('/activas',checkJwt,getActivaCategories);

router.get('/porcentaje/gastado',checkJwt,getTotalSpent);

router.get('/presupuestos',checkJwt, getBudgetSpent);
router.get('/:category_id',checkJwt, getSingleCategory);
router.put('/:category_id', checkJwt,updateCategory);
router.patch('/activar/:category_id',checkJwt,activarCategory);
router.patch('/desactivar/:category_id',checkJwt,desactivarCategory);



export { router };

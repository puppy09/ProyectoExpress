import {Router} from 'express';
import {activarCategory, desactivarCategory, getActivaCategories, getBudgetSpent, getCategory, getInactiveCategories, getSingleCategory, getTotalBudget, getTotalSpent, getTotalSpent3Months, getTotalSpent6Months, postCategory, updateCategory} from '../controllers/category'
import { checkJwt } from "../middleware/session";
const router = Router();

router.post('/', checkJwt,postCategory);
router.get('/',checkJwt, getCategory);
router.get('/totalBudget',checkJwt,getTotalBudget);
router.get('/activas',checkJwt,getActivaCategories);
router.get('/inactivas',checkJwt, getInactiveCategories);

router.get('/porcentaje/gastado',checkJwt,getTotalSpent);
router.get('/porcentaje/gastado/3',checkJwt,getTotalSpent3Months);
router.get('/porcentaje/gastado/6',checkJwt, getTotalSpent6Months);

router.get('/presupuestos',checkJwt, getBudgetSpent);
router.get('/:category_id',checkJwt, getSingleCategory);
router.put('/:category_id', checkJwt,updateCategory);
router.patch('/activar/:category_id',checkJwt,activarCategory);
router.patch('/desactivar/:category_id',checkJwt,desactivarCategory);



export { router };

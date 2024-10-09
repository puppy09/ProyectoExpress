import {Router} from 'express';
import {activarCategory, desactivarCategory, getCategory, getSingleCategory, postCategory, updateCategory} from '../controllers/category'
import { checkJwt } from "../middleware/session";
const router = Router();

router.post('/', checkJwt,postCategory);
router.get('/',checkJwt, getCategory);
router.get('/:category_id',checkJwt, getSingleCategory);
router.put('/:category_id', checkJwt,updateCategory);
router.patch('/activar/:category_id',checkJwt,activarCategory);
router.patch('/desactivar/:category_id',checkJwt,desactivarCategory);



export { router };

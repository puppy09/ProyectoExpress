import { Router } from 'express';
import { getUser, getUsers, updateUser, deleteUser } from '../controllers/user';
const router = Router();


router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);


export { router };
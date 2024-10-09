import { Router } from 'express';
import { getUser, getUsers, postUser, updateUser, deleteUser } from '../controllers/user';
const router = Router();


router.get('/', getUsers);
router.get('/:id', getUser);
router.post('/', postUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);


export { router };
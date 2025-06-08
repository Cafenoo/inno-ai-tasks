import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validateDto } from '../middleware/validation.middleware';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

const router = Router();

router.post('/', validateDto(CreateUserDto), UserController.createUser);
router.get('/:id', UserController.getUserById);
router.get('/', UserController.getAllUsers);
router.put('/:id', validateDto(UpdateUserDto), UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router; 
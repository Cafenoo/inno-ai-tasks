import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateDto } from '../middleware/validation.middleware';
import { LoginDto, RegisterDto } from '../dto/auth.dto';

const router = Router();

router.post('/register', validateDto(RegisterDto), AuthController.register);
router.post('/login', validateDto(LoginDto), AuthController.login);

export default router; 
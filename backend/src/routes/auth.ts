import { Router } from 'express';
import { register, login, logout } from '../controllers/auth';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators/auth';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);

export default router;

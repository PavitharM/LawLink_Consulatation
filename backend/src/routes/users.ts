import { Router } from 'express';
import { getMe, updateMe, getUsers, toggleUserStatus } from '../controllers/users';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Profile
router.get('/me', getMe);
router.put('/me', updateMe);

// Admin Only
router.get('/', requireRole(['ADMIN']), getUsers);
router.patch('/:id/status', requireRole(['ADMIN']), toggleUserStatus);

export default router;

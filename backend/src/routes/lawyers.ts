import { Router } from 'express';
import { getLawyers, getLawyerById, updateLawyerProfile, verifyLawyer } from '../controllers/lawyers';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Public
router.get('/', getLawyers);
router.get('/:id', getLawyerById);

// Lawyer routes
router.put('/me/profile', authenticate, requireRole(['LAWYER']), updateLawyerProfile);

// Admin routes
router.patch('/:id/verify', authenticate, requireRole(['ADMIN']), verifyLawyer);

export default router;

import { Router } from 'express';
import { getAdminStats, getReportData } from '../controllers/admin';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/stats', getAdminStats);
router.get('/report', getReportData);

export default router;

import { Router } from 'express';
import { getPackages, getAllPackages, createPackage, updatePackage, deletePackage } from '../controllers/packages';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { packageSchema, updatePackageSchema } from '../validators/package';

const router = Router();

// Publicly accessible active packages
router.get('/', getPackages);

// Admin and Lawyer routes
router.use(authenticate, requireRole(['ADMIN', 'LAWYER']));
router.get('/all', getAllPackages);
router.post('/', validateRequest(packageSchema), createPackage);
router.put('/:id', validateRequest(updatePackageSchema), updatePackage);
router.delete('/:id', deletePackage);

export default router;

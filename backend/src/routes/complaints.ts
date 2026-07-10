import { Router } from 'express';
import { createComplaint, getComplaints, getComplaintById, updateComplaintStatus, assignLawyer, rejectAssignment } from '../controllers/complaints';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { complaintSchema, updateComplaintSchema, assignLawyerSchema } from '../validators/complaint';

const router = Router();

router.use(authenticate);

router.post('/', requireRole(['USER']), validateRequest(complaintSchema), createComplaint);
router.get('/', getComplaints);
router.get('/:id', getComplaintById);
router.patch('/:id', requireRole(['ADMIN', 'LAWYER']), validateRequest(updateComplaintSchema), updateComplaintStatus);
router.post('/:id/assign', requireRole(['ADMIN', 'USER']), validateRequest(assignLawyerSchema), assignLawyer);
router.post('/:id/reject', requireRole(['LAWYER']), rejectAssignment);

export default router;

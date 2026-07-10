import { Router } from 'express';
import authRoutes from './auth';
import userRoutes from './users';
import lawyerRoutes from './lawyers';
import complaintRoutes from './complaints';
import packageRoutes from './packages';
import articleRoutes from './articles';
import adminRoutes from './admin';
import uploadRoutes from './upload';
import notificationRoutes from './notifications';
import messageRoutes from './messages';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/lawyers', lawyerRoutes);
router.use('/complaints', complaintRoutes);
router.use('/packages', packageRoutes);
router.use('/articles', articleRoutes);
router.use('/admin', adminRoutes);
router.use('/upload', uploadRoutes);
router.use('/notifications', notificationRoutes);
router.use('/messages', messageRoutes);

export default router;


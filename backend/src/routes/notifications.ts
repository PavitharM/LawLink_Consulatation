import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import {
  getUserNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  triggerEmergencyAlert
} from '../controllers/notifications';

const router = Router();

router.use(authenticate);

router.get('/', getUserNotifications);
router.post('/', createNotification);
router.post('/emergency', triggerEmergencyAlert);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/:id', dismissNotification);

export default router;

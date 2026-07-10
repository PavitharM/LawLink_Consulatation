import { Router } from 'express';
import { authenticate } from '../middleware/authMiddleware';
import { getMessages, sendMessage } from '../controllers/messages';

const router = Router();

router.use(authenticate);

router.get('/:otherUserId', getMessages);
router.post('/:otherUserId', sendMessage);

export default router;

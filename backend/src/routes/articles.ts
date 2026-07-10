import { Router } from 'express';
import { getArticles, getAllArticles, getArticleById, createArticle, updateArticle, deleteArticle } from '../controllers/articles';
import { authenticate, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validate';
import { articleSchema, updateArticleSchema } from '../validators/article';

const router = Router();

// Public
router.get('/', getArticles);
router.get('/:id', getArticleById);

// Admin/Lawyer only
router.use(authenticate, requireRole(['ADMIN', 'LAWYER']));
router.get('/admin/all', getAllArticles);
router.post('/', validateRequest(articleSchema), createArticle);
router.put('/:id', validateRequest(updateArticleSchema), updateArticle);
router.delete('/:id', deleteArticle);

export default router;

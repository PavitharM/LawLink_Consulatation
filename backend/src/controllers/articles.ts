import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { NotFoundError } from '../utils/errors';
import { AuthRequest } from '../middleware/authMiddleware';

export const getArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const articles = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'Articles retrieved',
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllArticles = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const articles = await prisma.article.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      message: 'All articles retrieved',
      data: articles,
    });
  } catch (error) {
    next(error);
  }
};

export const getArticleById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findUnique({
      where: { id: id as string },
      include: { author: { select: { name: true, avatar: true } } },
    });

    if (!article || article.status !== 'PUBLISHED') {
      throw new NotFoundError('Article not found');
    }

    // Increment views safely (could use a dedicated increment endpoint but this works for demo)
    await prisma.article.update({
      where: { id: id as string },
      data: { views: { increment: 1 } },
    });

    res.status(200).json({
      success: true,
      message: 'Article retrieved',
      data: article,
    });
  } catch (error) {
    next(error);
  }
};

export const createArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const { userId } = req.user!;
    
    const newArticle = await prisma.article.create({
      data: {
        ...data,
        authorId: userId,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: newArticle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const article = await prisma.article.findUnique({ where: { id: id as string } });
    if (!article) throw new NotFoundError('Article not found');

    const updated = await prisma.article.update({
      where: { id: id as string },
      data,
    });

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const article = await prisma.article.findUnique({ where: { id: id as string } });
    if (!article) throw new NotFoundError('Article not found');

    await prisma.article.delete({ where: { id: id as string } });

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

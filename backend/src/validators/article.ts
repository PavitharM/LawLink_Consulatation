import { z } from 'zod';

export const articleSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    category: z.string().min(2),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
    excerpt: z.string().min(10),
    content: z.string().optional(),
  })
});

export const updateArticleSchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    category: z.string().min(2).optional(),
    status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
    excerpt: z.string().min(10).optional(),
    content: z.string().optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  })
});

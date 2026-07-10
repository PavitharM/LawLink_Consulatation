import { z } from 'zod';

export const packageSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    price: z.number().min(0),
    period: z.string().min(2),
    description: z.string().optional(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    active: z.boolean().default(true),
    features: z.array(z.string()).min(1),
  })
});

export const updatePackageSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    price: z.number().min(0).optional(),
    period: z.string().min(2).optional(),
    description: z.string().optional(),
    icon: z.string().optional(),
    badge: z.string().optional(),
    active: z.boolean().optional(),
    features: z.array(z.string()).min(1).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  })
});

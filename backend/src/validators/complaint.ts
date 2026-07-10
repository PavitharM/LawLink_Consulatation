import { z } from 'zod';

export const complaintSchema = z.object({
  body: z.object({
    title: z.string().min(5),
    category: z.string().min(2),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).default('LOW'),
    description: z.string().min(10),
    incidentDate: z.string().datetime().optional(),
    location: z.string().optional(),
    opposingParty: z.string().optional(),
    packageId: z.string().uuid().optional(),
  })
});

export const updateComplaintSchema = z.object({
  body: z.object({
    status: z.enum(['OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED']).optional(),
    priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  }),
  params: z.object({
    id: z.string().uuid(),
  })
});

export const assignLawyerSchema = z.object({
  body: z.object({
    lawyerId: z.string().uuid(),
  }),
  params: z.object({
    id: z.string().uuid(),
  })
});

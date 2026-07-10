import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { env } from '../config/env';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof ZodError) {
    const zodErr = err as any;
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: zodErr.errors.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma Client Known Request Error handling can go here, like unique constraint violations
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'A record with this value already exists',
        field: prismaError.meta?.target,
      });
    }
  }

  console.error('Unhandled Error:', err);

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
  });
};

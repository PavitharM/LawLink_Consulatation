import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { NotFoundError, ForbiddenError, BadRequestError } from '../utils/errors';
import { AuthRequest } from '../middleware/authMiddleware';

export const getPackages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const packages = await prisma.package.findMany({
      where: { active: true },
      orderBy: { price: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Packages retrieved',
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPackages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const isAdmin = req.user?.role === 'ADMIN';
    const whereClause = isAdmin ? {} : { lawyerId: req.user?.userId };

    const packages = await prisma.package.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { complaints: true } }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Packages retrieved',
      data: packages,
    });
  } catch (error) {
    next(error);
  }
};

export const createPackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Whitelist allowed fields to prevent injection of id, createdAt, etc.
    const { name, price, period, description, icon, badge, active, features } = req.body;

    const data: Record<string, unknown> = {
      name,
      price,
      period,
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(badge !== undefined && { badge }),
      ...(active !== undefined && { active }),
      ...(features !== undefined && { features }),
    };

    if (req.user?.role === 'LAWYER') {
      data.lawyerId = req.user.userId;
    }

    const newPackage = await prisma.package.create({ data: data as any });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: newPackage,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const pkg = await prisma.package.findUnique({ where: { id: id as string } });
    if (!pkg) throw new NotFoundError('Package not found');

    if (req.user?.role === 'LAWYER' && pkg.lawyerId  !== req.user.userId) {
      throw new ForbiddenError('You do not have permission to update this package');
    }

    // Whitelist allowed fields to prevent overriding lawyerId, id, etc.
    const { name, price, period, description, icon, badge, active, features } = req.body;

    const data: Record<string, unknown> = {
      ...(name !== undefined && { name }),
      ...(price !== undefined && { price }),
      ...(period !== undefined && { period }),
      ...(description !== undefined && { description }),
      ...(icon !== undefined && { icon }),
      ...(badge !== undefined && { badge }),
      ...(active !== undefined && { active }),
      ...(features !== undefined && { features }),
    };

    const updated = await prisma.package.update({
      where: { id: id as string },
      data: data as any,
    });

    res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePackage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const pkg = await prisma.package.findUnique({
      where: { id: id as string },
      include: { _count: { select: { complaints: true } } },
    });
    if (!pkg) throw new NotFoundError('Package not found');

    if (req.user?.role === 'LAWYER' && pkg.lawyerId !== req.user.userId) {
      throw new ForbiddenError('You do not have permission to delete this package');
    }

    // Prevent deletion if complaints are linked to this package
    if (pkg._count.complaints > 0) {
      throw new BadRequestError(
        `Cannot delete this package — ${pkg._count.complaints} complaint(s) are linked to it. Deactivate it instead.`
      );
    }

    await prisma.package.delete({ where: { id: id as string } });

    res.status(200).json({
      success: true,
      message: 'Package deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

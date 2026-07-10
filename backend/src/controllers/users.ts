import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';
import { NotFoundError } from '../utils/errors';

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        lawyerProfile: true,
        clientProfile: true,
      },
    });

    if (!user) throw new NotFoundError('User not found');

    res.status(200).json({
      success: true,
      message: 'Profile retrieved',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { name, phone, city, clientProfile, lawyerProfile } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, city },
    });

    if (clientProfile) {
      const existingProfile = await prisma.clientProfile.findUnique({ where: { userId } });
      if (!existingProfile) {
        await prisma.clientProfile.create({ data: { ...clientProfile, userId } });
      } else {
        await prisma.clientProfile.update({
          where: { userId },
          data: clientProfile,
        });
      }
    }

    if (lawyerProfile) {
      const existingLawyerProfile = await prisma.lawyerProfile.findUnique({ where: { userId } });
      if (!existingLawyerProfile) {
        await prisma.lawyerProfile.create({ data: { ...lawyerProfile, userId } });
      } else {
        await prisma.lawyerProfile.update({
          where: { userId },
          data: lawyerProfile,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        role: true,
        status: true,
        createdAt: true,
        lawyerProfile: true,
        _count: {
          select: { complaints: true },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: 'Users retrieved',
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updated = await prisma.user.update({
      where: { id: id as string },
      data: { status },
      select: { id: true, name: true, status: true },
    });

    res.status(200).json({
      success: true,
      message: `User status changed to ${status}`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

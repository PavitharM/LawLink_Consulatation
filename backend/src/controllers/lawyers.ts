import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { NotFoundError } from '../utils/errors';
import { AuthRequest } from '../middleware/authMiddleware';

export const getLawyers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const lawyers = await prisma.user.findMany({
      where: { role: 'LAWYER', status: 'ACTIVE' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        lawyerProfile: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Lawyers retrieved',
      data: lawyers,
    });
  } catch (error) {
    next(error);
  }
};

export const getLawyerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const lawyer = await prisma.user.findUnique({
      where: { id: id as string, role: 'LAWYER' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        avatar: true,
        lawyerProfile: true,
      },
    });

    if (!lawyer) throw new NotFoundError('Lawyer not found');

    res.status(200).json({
      success: true,
      message: 'Lawyer retrieved',
      data: lawyer,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLawyerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { name, email, phone, lawyerProfile } = req.body;

    // Update base user info if provided
    if (name || email || phone) {
      const updateData: any = {};
      if (name) updateData.name = name;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      
      await prisma.user.update({
        where: { id: userId },
        data: updateData
      });
    }

    // Update lawyer profile fields
    if (lawyerProfile) {
      const profile = await prisma.lawyerProfile.findUnique({ where: { userId } });
      if (!profile) {
        await prisma.lawyerProfile.create({ data: { ...lawyerProfile, userId } });
      } else {
        await prisma.lawyerProfile.update({
          where: { userId },
          data: lawyerProfile,
        });
      }
    }

    const updatedProfile = await prisma.lawyerProfile.findUnique({ where: { userId } });

    res.status(200).json({
      success: true,
      message: 'Lawyer profile updated',
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyLawyer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const profile = await prisma.lawyerProfile.update({
      where: { userId: id as string },
      data: { isVerified },
    });

    res.status(200).json({
      success: true,
      message: `Lawyer verification status changed to ${isVerified}`,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

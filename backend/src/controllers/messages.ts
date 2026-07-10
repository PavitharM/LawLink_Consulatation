import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMessages = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const otherUserId = req.params.otherUserId as string;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.status(200).json({
      success: true,
      message: 'Messages retrieved',
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const otherUserId = req.params.otherUserId as string;
    const { text } = req.body;

    const message = await prisma.message.create({
      data: {
        senderId: userId,
        receiverId: otherUserId,
        text,
      },
    });

    const sender = await prisma.user.findUnique({ where: { id: userId } });
    const receiver = await prisma.user.findUnique({ where: { id: otherUserId } });

    if (sender && receiver && sender.role === 'USER' && receiver.role === 'LAWYER') {
      const complaint = await prisma.complaint.findFirst({
        where: { clientId: userId, assignedToId: otherUserId },
        orderBy: { createdAt: 'desc' },
      });
      const linkStr = complaint ? `/lawyer/complaint/${complaint.id}#chat` : null;

      await prisma.notification.create({
        data: {
          userId: otherUserId,
          title: 'New Message from Client',
          message: `${sender.name} sent you a message: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`,
          type: 'message',
          link: linkStr,
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

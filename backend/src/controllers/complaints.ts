import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { NotFoundError } from '../utils/errors';
import { AuthRequest } from '../middleware/authMiddleware';

export const createComplaint = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, category, priority, description, incidentDate, location, opposingParty, packageId } = req.body;
    const clientId = req.user!.userId;

    // If a package is selected, check if it belongs to a lawyer
    let assignedLawyerId: string | null = null;
    let packageName: string | null = null;
    if (packageId) {
      const pkg = await prisma.package.findUnique({ where: { id: packageId } });
      if (pkg?.lawyerId) {
        assignedLawyerId = pkg.lawyerId;
        packageName = pkg.name;
      }
    }

    const complaint = await prisma.complaint.create({
      data: {
        title,
        category,
        priority,
        description,
        incidentDate: incidentDate ? new Date(incidentDate) : null,
        location,
        opposingParty,
        packageId,
        clientId,
        assignedToId: assignedLawyerId, // Auto-assign if package belongs to lawyer
      },
    });

    await prisma.notification.create({
      data: {
        userId: clientId,
        title: 'Case Submitted Successfully',
        message: `Your case "${complaint.title}" has been successfully submitted and is pending review.`,
        type: 'case',
      }
    });

    if (assignedLawyerId) {
      await prisma.notification.create({
        data: {
          userId: assignedLawyerId,
          title: 'New Case Assigned (Package Booked)',
          message: `A client has booked your "${packageName}" package and submitted case "${complaint.title}".`,
          type: 'payment',
          link: `/lawyer/complaint/${complaint.id}`
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, role } = req.user!;
    let complaints;

    if (role === 'ADMIN') {
      complaints = await prisma.complaint.findMany({
        include: { client: { select: { name: true, email: true } }, assignedTo: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'LAWYER') {
      complaints = await prisma.complaint.findMany({
        where: { assignedToId: userId },
        include: { client: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      complaints = await prisma.complaint.findMany({
        where: { clientId: userId },
        include: { assignedTo: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaints retrieved successfully',
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user!;

    const complaint = await prisma.complaint.findUnique({
      where: { id: id as string },
      include: {
        client: { select: { id: true, name: true, email: true, phone: true } },
        assignedTo: { select: { id: true, name: true, email: true, phone: true } },
        documents: true,
        package: true,
      },
    });

    if (!complaint) {
      throw new NotFoundError('Complaint not found');
    }

    // Authorization checks
    if (role === 'USER' && complaint.clientId !== userId) {
      throw new NotFoundError('Complaint not found'); // Hide existence
    }
    if (role === 'LAWYER' && complaint.assignedToId !== userId) {
      throw new NotFoundError('Complaint not found');
    }

    res.status(200).json({
      success: true,
      message: 'Complaint retrieved successfully',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, priority, hearingDate, resolutionOutcome, resolutionSummary } = req.body;

    const complaint = await prisma.complaint.findUnique({ where: { id: id as string } });
    if (!complaint) throw new NotFoundError('Complaint not found');

    const updated = await prisma.complaint.update({
      where: { id: id as string },
      data: {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(hearingDate !== undefined && { hearingDate: hearingDate ? new Date(hearingDate) : null }),
        ...(resolutionOutcome !== undefined && { resolutionOutcome }),
        ...(resolutionSummary !== undefined && { resolutionSummary }),
      },
    });

    if (status) {
      await prisma.notification.create({
        data: {
          userId: updated.clientId,
          title: 'Case Status Updated',
          message: `Your case "${updated.title}" status is now ${status}.`,
          type: 'case',
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const assignLawyer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { lawyerId } = req.body;
    const { userId, role } = req.user!;

    const complaint = await prisma.complaint.findUnique({ where: { id: id as string } });
    if (!complaint) throw new NotFoundError('Complaint not found');

    if (role === 'USER' && complaint.clientId !== userId) {
      throw new NotFoundError('Complaint not found');
    }

    const lawyer = await prisma.user.findUnique({ where: { id: lawyerId, role: 'LAWYER' } });
    if (!lawyer) throw new NotFoundError('Lawyer not found');

    const updated = await prisma.complaint.update({
      where: { id: id as string },
      data: {
        assignedToId: lawyerId,
      },
    });

    await prisma.notification.create({
      data: {
        userId: complaint.clientId,
        title: 'Lawyer Assigned to Your Case',
        message: `${lawyer.name} has been assigned to your case "${updated.title}" (${updated.id.split('-')[0]}).`,
        type: 'lawyer',
      }
    });

    // Notify the lawyer
    await prisma.notification.create({
      data: {
        userId: lawyerId,
        title: 'New Case Assigned',
        message: `You have been assigned to case "${updated.title}" by the Admin.`,
        type: 'case',
        link: `/lawyer/complaint/${updated.id}`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Lawyer assigned successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { userId } = req.user!;

    const complaint = await prisma.complaint.findUnique({ where: { id: id as string } });
    if (!complaint) throw new NotFoundError('Complaint not found');

    // Ensure the lawyer rejecting is the one currently assigned
    if (complaint.assignedToId !== userId) {
      throw new NotFoundError('Complaint not found');
    }

    const updated = await prisma.complaint.update({
      where: { id: id as string },
      data: {
        assignedToId: null,
        status: 'OPEN'
      },
    });

    res.status(200).json({
      success: true,
      message: 'Assignment rejected successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

import { Response, NextFunction } from 'express';
import { prisma } from '../prisma';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAdminStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalUsers,
      totalLawyers,
      totalComplaints,
      openComplaints,
      inReviewComplaints,
      resolvedComplaints,
      unassignedComplaints,
      totalArticles,
      recentComplaints,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.user.count({ where: { role: 'LAWYER' } }),
      prisma.complaint.count(),
      prisma.complaint.count({ where: { status: 'OPEN' } }),
      prisma.complaint.count({ where: { status: 'IN_REVIEW' } }),
      prisma.complaint.count({ where: { status: 'RESOLVED' } }),
      prisma.complaint.count({ where: { assignedToId: null, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.article.count(),
      // Recent activity: last 5 complaints
      prisma.complaint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true } } },
      }),
      // Recent users registered
      prisma.user.findMany({
        take: 5,
        where: { role: { not: 'ADMIN' } },
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, role: true, createdAt: true },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Stats retrieved',
      data: {
        totalUsers,
        totalLawyers,
        totalComplaints,
        openComplaints,
        inReviewComplaints,
        resolvedComplaints,
        unassignedComplaints,
        totalArticles,
        recentComplaints,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReportData = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    // ── KPI data ──
    const [totalUsers, totalLawyers, totalComplaints, openComplaints, inReviewComplaints, resolvedComplaints, closedComplaints] =
      await Promise.all([
        prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
        prisma.user.count({ where: { role: 'LAWYER', status: 'ACTIVE' } }),
        prisma.complaint.count(),
        prisma.complaint.count({ where: { status: 'OPEN' } }),
        prisma.complaint.count({ where: { status: 'IN_REVIEW' } }),
        prisma.complaint.count({ where: { status: 'RESOLVED' } }),
        prisma.complaint.count({ where: { status: 'CLOSED' } }),
      ]);

    // Cases this month
    const monthStart = new Date(currentYear, now.getMonth(), 1);
    const casesThisMonth = await prisma.complaint.count({
      where: { createdAt: { gte: monthStart } },
    });

    // Previous month cases (for % change)
    const prevMonthStart = new Date(currentYear, now.getMonth() - 1, 1);
    const casesPrevMonth = await prisma.complaint.count({
      where: { createdAt: { gte: prevMonthStart, lt: monthStart } },
    });

    // ── Monthly user growth (last 6 months) ──
    const userGrowth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(currentYear, now.getMonth() - i, 1);
      const end = new Date(currentYear, now.getMonth() - i + 1, 1);
      const count = await prisma.user.count({
        where: { role: { not: 'ADMIN' }, createdAt: { lt: end } },
      });
      const monthName = start.toLocaleString('en-US', { month: 'short' });
      userGrowth.push({ month: monthName, count });
    }

    // ── Monthly revenue from packages (last 6 months) ──
    // Revenue = sum of package prices attached to complaints created in each month
    const revenueByMonth: { month: string; amount: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(currentYear, now.getMonth() - i, 1);
      const end = new Date(currentYear, now.getMonth() - i + 1, 1);
      const complaints = await prisma.complaint.findMany({
        where: { createdAt: { gte: start, lt: end }, packageId: { not: null } },
        include: { package: { select: { price: true } } },
      });
      const total = complaints.reduce((sum, c) => sum + (c.package?.price || 0), 0);
      const monthName = start.toLocaleString('en-US', { month: 'short' });
      revenueByMonth.push({ month: monthName, amount: total });
    }

    const totalRevenue = revenueByMonth.reduce((s, r) => s + r.amount, 0);

    // ── Case category breakdown ──
    const allComplaints = await prisma.complaint.findMany({
      select: { category: true },
    });
    const catMap: Record<string, number> = {};
    allComplaints.forEach((c) => {
      catMap[c.category] = (catMap[c.category] || 0) + 1;
    });
    const categoryBreakdown = Object.entries(catMap)
      .map(([label, count]) => ({
        label,
        count,
        pct: totalComplaints > 0 ? Math.round((count / totalComplaints) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // ── Resolution overview ──
    const resolutionOverview = [
      { label: 'Resolved', count: resolvedComplaints, pct: totalComplaints > 0 ? Math.round((resolvedComplaints / totalComplaints) * 100) : 0 },
      { label: 'In Review', count: inReviewComplaints, pct: totalComplaints > 0 ? Math.round((inReviewComplaints / totalComplaints) * 100) : 0 },
      { label: 'Open', count: openComplaints, pct: totalComplaints > 0 ? Math.round((openComplaints / totalComplaints) * 100) : 0 },
      { label: 'Closed', count: closedComplaints, pct: totalComplaints > 0 ? Math.round((closedComplaints / totalComplaints) * 100) : 0 },
    ];

    const successRate = totalComplaints > 0 ? Math.round(((resolvedComplaints + closedComplaints) / totalComplaints) * 100) : 0;

    // ── Top performing lawyers (by assigned cases) ──
    const lawyers = await prisma.user.findMany({
      where: { role: 'LAWYER' },
      select: {
        id: true,
        name: true,
        lawyerProfile: { select: { specialization: true, consultationFee: true } },
        assignedCases: { select: { id: true } },
      },
    });

    const topLawyers = lawyers
      .map((l) => ({
        name: l.name,
        specialization: l.lawyerProfile?.specialization || 'General',
        cases: l.assignedCases.length,
        consultationFee: l.lawyerProfile?.consultationFee || 0,
        initials: l.name
          .split(' ')
          .map((w: string) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 5);

    res.status(200).json({
      success: true,
      message: 'Report data retrieved',
      data: {
        kpis: {
          totalUsers,
          totalLawyers,
          casesThisMonth,
          casesPrevMonth,
          totalRevenue,
        },
        userGrowth,
        revenueByMonth,
        categoryBreakdown,
        resolutionOverview,
        successRate,
        topLawyers,
      },
    });
  } catch (error) {
    next(error);
  }
};

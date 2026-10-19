import { Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getProductionJobs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { stage, status, page = '1', limit = '30' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (stage && stage !== 'ALL') where.stage = String(stage);
    if (status && status !== 'ALL') where.status = String(status);

    const [jobs, total] = await Promise.all([
      prisma.productionJob.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            include: {
              customer: { select: { fullName: true, phone: true } },
              items: true
            }
          },
          assignedStaff: { select: { id: true, fullName: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.productionJob.count({ where })
    ]);

    res.json({
      success: true,
      jobs,
      pagination: {
        page: pageNum,
        limit: take,
        total,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProductionJob(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const {
      stage,
      stageBn,
      quantityProduced,
      quantityWasted,
      machineNotes,
      assignedStaffId,
      status
    } = req.body;

    const job = await prisma.productionJob.findUnique({
      where: { id },
      include: { order: true }
    });

    if (!job) {
      res.status(404).json({ success: false, message: 'Production job not found' });
      return;
    }

    const updatedJob = await prisma.productionJob.update({
      where: { id },
      data: {
        stage: stage || undefined,
        stageBn: stageBn || undefined,
        quantityProduced: quantityProduced !== undefined ? parseFloat(quantityProduced) : undefined,
        quantityWasted: quantityWasted !== undefined ? parseFloat(quantityWasted) : undefined,
        machineNotes: machineNotes !== undefined ? machineNotes : undefined,
        assignedStaffId: assignedStaffId !== undefined ? assignedStaffId : undefined,
        status: status || undefined,
        completedAt: stage === 'DELIVERED' ? new Date() : undefined
      },
      include: {
        order: { include: { customer: true, items: true } },
        assignedStaff: true
      }
    });

    // If production job progresses to DELIVERED or READY_FOR_DELIVERY, sync order production status
    if (stage === 'READY_FOR_DELIVERY' || stage === 'DELIVERED' || stage === 'PRINTING') {
      let orderProdStatus = job.order.productionStatus;
      if (stage === 'PRINTING') orderProdStatus = 'IN_PRODUCTION';
      if (stage === 'READY_FOR_DELIVERY') orderProdStatus = 'READY_FOR_DELIVERY';
      if (stage === 'DELIVERED') orderProdStatus = 'DELIVERED';

      await prisma.order.update({
        where: { id: job.orderId },
        data: { productionStatus: orderProdStatus }
      });
    }

    res.json({ success: true, job: updatedJob });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

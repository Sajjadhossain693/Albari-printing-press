import { Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { generateCode } from '../utils/formatters.js';
import { determinePaymentStatus } from '../services/financialService.js';

export async function getPayments(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { orderId, customerId, method, startDate, endDate, page = '1', limit = '30' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (orderId) where.orderId = String(orderId);
    if (customerId) where.customerId = String(customerId);
    if (method && method !== 'ALL') where.method = String(method);
    if (startDate || endDate) {
      where.paymentDate = {};
      if (startDate) where.paymentDate.gte = new Date(String(startDate));
      if (endDate) where.paymentDate.lte = new Date(String(endDate));
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take,
        include: {
          customer: { select: { id: true, fullName: true, phone: true } },
          order: { select: { id: true, orderNumber: true, totalAmount: true } },
          receivedBy: { select: { id: true, fullName: true } }
        },
        orderBy: { paymentDate: 'desc' }
      }),
      prisma.payment.count({ where })
    ]);

    res.json({
      success: true,
      payments,
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

export async function recordPayment(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { orderId, amount, method, referenceNumber, notes, paymentDate } = req.body;

    const numAmount = parseFloat(amount);
    if (!orderId || isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ success: false, message: 'Valid order ID and positive payment amount are required' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true, refunds: true }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Check if amount exceeds remaining due
    if (numAmount > order.amountDue + 0.01) {
      res.status(400).json({
        success: false,
        message: `Payment amount (৳${numAmount}) cannot exceed current outstanding due (৳${order.amountDue})`
      });
      return;
    }

    const userId = req.user?.userId || (await prisma.user.findFirst())?.id || 'system';

    const payCount = await prisma.payment.count();
    const paymentNumber = generateCode('PAY', payCount + 1);
    const receiptNumber = generateCode('RCT', payCount + 1);

    // Run in transaction to update order and create payment ledger atomically
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          orderId,
          customerId: order.customerId,
          amount: numAmount,
          method: method || 'CASH',
          referenceNumber: referenceNumber || null,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
          receivedById: userId,
          notes: notes || null,
          receiptNumber
        },
        include: {
          customer: true,
          order: true,
          receivedBy: true
        }
      });

      // Recalculate order totals
      const newAmountPaid = order.amountPaid + numAmount;
      const newAmountDue = Math.max(0, order.totalAmount - newAmountPaid);
      const newPaymentStatus = determinePaymentStatus(order.totalAmount, newAmountPaid);

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          paymentStatus: newPaymentStatus
        }
      });

      // Create Audit Log
      await tx.auditLog.create({
        data: {
          userId,
          action: 'PAYMENT',
          entityType: 'PAYMENT',
          entityId: payment.id,
          details: `Recorded payment of ৳${numAmount} for order ${order.orderNumber} via ${method}`
        }
      });

      return { payment, order: updatedOrder };
    });

    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function processRefund(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { orderId, paymentId, amount, reason, method } = req.body;
    const numAmount = parseFloat(amount);

    if (!orderId || isNaN(numAmount) || numAmount <= 0 || !reason) {
      res.status(400).json({ success: false, message: 'Valid order ID, positive refund amount, and reason are required' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    if (numAmount > order.amountPaid) {
      res.status(400).json({ success: false, message: 'Refund amount cannot exceed total amount paid' });
      return;
    }

    const userId = req.user?.userId || (await prisma.user.findFirst())?.id || 'system';

    const refCount = await prisma.refund.count();
    const refundNumber = generateCode('REF', refCount + 1);

    const result = await prisma.$transaction(async (tx) => {
      const refund = await tx.refund.create({
        data: {
          refundNumber,
          orderId,
          paymentId: paymentId || null,
          amount: numAmount,
          method: method || 'CASH',
          reason,
          processedById: userId
        }
      });

      const newAmountPaid = Math.max(0, order.amountPaid - numAmount);
      const newAmountDue = Math.max(0, order.totalAmount - newAmountPaid);
      const newPaymentStatus = determinePaymentStatus(order.totalAmount, newAmountPaid, numAmount);

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          amountPaid: newAmountPaid,
          amountDue: newAmountDue,
          paymentStatus: newPaymentStatus
        }
      });

      await tx.auditLog.create({
        data: {
          userId,
          action: 'REFUND',
          entityType: 'REFUND',
          entityId: refund.id,
          details: `Processed refund of ৳${numAmount} for order ${order.orderNumber}. Reason: ${reason}`
        }
      });

      return { refund, order: updatedOrder };
    });

    res.status(201).json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

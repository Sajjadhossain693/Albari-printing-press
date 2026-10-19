import { Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { generateCode } from '../utils/formatters.js';

export async function getInvoices(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { page = '1', limit = '30' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * take;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        skip,
        take,
        include: {
          customer: true,
          order: {
            include: { items: true, payments: true }
          }
        },
        orderBy: { issueDate: 'desc' }
      }),
      prisma.invoice.count()
    ]);

    res.json({
      success: true,
      invoices,
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

export async function getInvoiceByOrderId(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const orderId = String(req.params.orderId);

    let invoice = await prisma.invoice.findFirst({
      where: { orderId },
      include: {
        customer: true,
        order: {
          include: {
            items: true,
            payments: {
              include: { receivedBy: { select: { fullName: true } } }
            }
          }
        }
      }
    });

    // If invoice not generated yet, auto-create one for this order!
    if (!invoice) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { customer: true, items: true, payments: true }
      });

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
      }

      const invCount = await prisma.invoice.count();
      const invoiceNumber = generateCode('INV', invCount + 1);

      invoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          orderId: order.id,
          customerId: order.customerId,
          subtotal: order.subtotal,
          discount: order.discount,
          deliveryCharge: order.deliveryCharge,
          additionalCharges: order.additionalCharges,
          totalAmount: order.totalAmount,
          amountPaid: order.amountPaid,
          amountDue: order.amountDue,
          paymentStatus: order.paymentStatus
        },
        include: {
          customer: true,
          order: {
            include: {
              items: true,
              payments: {
                include: { receivedBy: { select: { fullName: true } } }
              }
            }
          }
        }
      });
    }

    // Get current business settings
    const settings = await prisma.businessSettings.findFirst();

    res.json({ success: true, invoice, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

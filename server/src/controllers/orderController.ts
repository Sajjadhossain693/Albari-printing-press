import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { calculateOrderTotals, determinePaymentStatus } from '../services/financialService.js';
import { generateCode } from '../utils/formatters.js';

export async function getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      search,
      productionStatus,
      paymentStatus,
      customerId,
      startDate,
      endDate,
      page = '1',
      limit = '30'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * take;

    const where: any = {};

    // Customer role can only view their own orders
    if (req.user?.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({
        where: { phone: req.user.username }
      });
      if (customer) {
        where.customerId = customer.id;
      } else {
        res.json({ success: true, orders: [], pagination: { page: 1, limit: take, total: 0, totalPages: 0 } });
        return;
      }
    } else if (customerId) {
      where.customerId = String(customerId);
    }

    if (productionStatus && productionStatus !== 'ALL') {
      where.productionStatus = String(productionStatus);
    }

    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = String(paymentStatus);
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) where.orderDate.gte = new Date(String(startDate));
      if (endDate) where.orderDate.lte = new Date(String(endDate));
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { orderNumber: { contains: q } },
        { customer: { fullName: { contains: q } } },
        { customer: { phone: { contains: q } } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take,
        include: {
          customer: true,
          items: true,
          assignedDesigner: { select: { id: true, fullName: true } },
          assignedStaff: { select: { id: true, fullName: true } },
          payments: { select: { id: true, amount: true, paymentDate: true, method: true } }
        },
        orderBy: { orderDate: 'desc' }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      orders,
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

export async function getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, fullName: true, role: true } },
        assignedDesigner: { select: { id: true, fullName: true } },
        assignedStaff: { select: { id: true, fullName: true } },
        items: true,
        payments: {
          include: { receivedBy: { select: { fullName: true } } },
          orderBy: { paymentDate: 'desc' }
        },
        refunds: true,
        invoices: true,
        statusHistory: {
          include: { changedBy: { select: { fullName: true } } },
          orderBy: { createdAt: 'desc' }
        },
        productionJobs: true,
        designAssets: true
      }
    });

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Role check for customer
    if (req.user?.role === 'CUSTOMER') {
      const customer = await prisma.customer.findUnique({ where: { phone: req.user.username } });
      if (!customer || customer.id !== order.customerId) {
        res.status(403).json({ success: false, message: 'Access denied to this order' });
        return;
      }
    }

    res.json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      customerId,
      customerName,
      customerPhone,
      customerAddress,
      deliveryDate,
      priority,
      items,
      discount,
      deliveryCharge,
      additionalCharges,
      advancePayment,
      paymentMethod,
      customerNotes,
      internalNotes,
      assignedDesignerId,
      assignedStaffId,
      designAttachment
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ success: false, message: 'At least one order item is required' });
      return;
    }

    // Resolve or create customer
    let actualCustomerId = customerId;
    if (!actualCustomerId) {
      if (!customerName || !customerPhone) {
        res.status(400).json({ success: false, message: 'Customer name and phone are required' });
        return;
      }

      let existing = await prisma.customer.findUnique({ where: { phone: customerPhone.trim() } });
      if (existing) {
        actualCustomerId = existing.id;
      } else {
        const custCount = await prisma.customer.count();
        const customerCode = `CUST-${String(custCount + 1).padStart(4, '0')}`;
        const newCust = await prisma.customer.create({
          data: {
            customerCode,
            fullName: customerName.trim(),
            phone: customerPhone.trim(),
            address: customerAddress || null
          }
        });
        actualCustomerId = newCust.id;
      }
    }

    // Calculate authoritative totals
    const calculated = calculateOrderTotals({
      items,
      discount: parseFloat(discount) || 0,
      deliveryCharge: parseFloat(deliveryCharge) || 0,
      additionalCharges: parseFloat(additionalCharges) || 0
    });

    const advance = Math.max(0, parseFloat(advancePayment) || 0);
    const amountPaid = Math.min(advance, calculated.totalAmount);
    const amountDue = Math.max(0, calculated.totalAmount - amountPaid);
    const initialPaymentStatus = determinePaymentStatus(calculated.totalAmount, amountPaid);

    // Generate Order Number
    const orderCount = await prisma.order.count();
    const orderNumber = generateCode('PR', orderCount + 1);
    const trackingToken = crypto.randomBytes(16).toString('hex');

    // System or logged-in user id
    const userId = req.user?.userId || (await prisma.user.findFirst())?.id || 'system';

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: actualCustomerId,
        createdById: userId,
        assignedDesignerId: assignedDesignerId || null,
        assignedStaffId: assignedStaffId || null,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
        productionStatus: 'PENDING',
        paymentStatus: initialPaymentStatus,
        priority: priority || 'NORMAL',
        subtotal: calculated.subtotal,
        discount: calculated.discount,
        deliveryCharge: calculated.deliveryCharge,
        additionalCharges: calculated.additionalCharges,
        totalAmount: calculated.totalAmount,
        amountPaid,
        amountDue,
        customerNotes: customerNotes || null,
        internalNotes: internalNotes || null,
        trackingToken,
        designAttachment: designAttachment || null,
        items: {
          create: items.map((it: any) => ({
            productId: it.productId || null,
            productName: it.productName,
            productNameBn: it.productNameBn || null,
            specifications: it.specifications || null,
            quantity: Math.max(1, parseFloat(it.quantity) || 1),
            unit: it.unit || 'PIECE',
            unitBn: it.unitBn || 'টি',
            unitPrice: Math.max(0, parseFloat(it.unitPrice) || 0),
            subtotal: (Math.max(1, parseFloat(it.quantity) || 1)) * (Math.max(0, parseFloat(it.unitPrice) || 0)),
            notes: it.notes || null
          }))
        },
        statusHistory: {
          create: {
            fromStatus: 'DRAFT',
            toStatus: 'PENDING',
            changedById: userId,
            notes: 'Order created'
          }
        }
      },
      include: {
        customer: true,
        items: true
      }
    });

    // Record advance payment if provided
    if (advance > 0) {
      const payCount = await prisma.payment.count();
      const paymentNumber = generateCode('PAY', payCount + 1);
      await prisma.payment.create({
        data: {
          paymentNumber,
          orderId: order.id,
          customerId: actualCustomerId,
          amount: advance,
          method: paymentMethod || 'CASH',
          referenceNumber: `Advance for ${order.orderNumber}`,
          receivedById: userId,
          notes: 'Advance payment collected during order placement'
        }
      });
    }

    // Auto-create Production Job
    const prdCount = await prisma.productionJob.count();
    const jobCode = generateCode('PRD', prdCount + 1);
    await prisma.productionJob.create({
      data: {
        jobCode,
        orderId: order.id,
        assignedStaffId: assignedStaffId || null,
        stage: 'ORDER_CONFIRMED',
        stageBn: 'অর্ডার নিশ্চিত',
        quantityOrdered: items.reduce((acc: number, it: any) => acc + (parseFloat(it.quantity) || 1), 0),
        status: 'IN_PROGRESS'
      }
    });

    res.status(201).json({ success: true, order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProductionStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { status, notes } = req.body;

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    const previousStatus = order.productionStatus;
    const updated = await prisma.order.update({
      where: { id },
      data: {
        productionStatus: status
      }
    });

    const userId = req.user?.userId || (await prisma.user.findFirst())?.id || 'system';

    await prisma.orderStatusHistory.create({
      data: {
        orderId: id,
        fromStatus: previousStatus,
        toStatus: status,
        changedById: userId,
        notes: notes || `Production status changed to ${status}`
      }
    });

    res.json({ success: true, order: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

// Secure Public Tracking Endpoint (No sensitive customer data leakage)
export async function trackOrderPublic(req: Request, res: Response): Promise<void> {
  try {
    const { token, orderNumber, phone } = req.query;

    let order = null;

    if (token) {
      order = await prisma.order.findUnique({
        where: { trackingToken: String(token) },
        select: {
          orderNumber: true,
          orderDate: true,
          deliveryDate: true,
          productionStatus: true,
          paymentStatus: true,
          priority: true,
          items: {
            select: {
              productName: true,
              productNameBn: true,
              quantity: true,
              unitBn: true
            }
          },
          statusHistory: {
            select: {
              toStatus: true,
              createdAt: true,
              notes: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    } else if (orderNumber && phone) {
      const found = await prisma.order.findFirst({
        where: {
          orderNumber: String(orderNumber).trim(),
          customer: { phone: String(phone).trim() }
        },
        select: {
          orderNumber: true,
          orderDate: true,
          deliveryDate: true,
          productionStatus: true,
          paymentStatus: true,
          priority: true,
          items: {
            select: {
              productName: true,
              productNameBn: true,
              quantity: true,
              unitBn: true
            }
          },
          statusHistory: {
            select: {
              toStatus: true,
              createdAt: true,
              notes: true
            },
            orderBy: { createdAt: 'desc' }
          }
        }
      });
      order = found;
    }

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found or verification mismatch' });
      return;
    }

    res.json({ success: true, tracking: order });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

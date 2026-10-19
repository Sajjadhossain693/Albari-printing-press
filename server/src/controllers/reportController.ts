import { Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { timeRange = 'thisMonth' } = req.query;

    const now = new Date();
    let startDate = new Date();

    if (timeRange === 'today') {
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'last7Days') {
      startDate.setDate(now.getDate() - 7);
    } else if (timeRange === 'thisMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeRange === 'lastMonth') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      now.setDate(0); // end of last month
    } else {
      // all time
      startDate = new Date(2020, 0, 1);
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      todayOrdersCount,
      rangeOrdersCount,
      pendingOrdersCount,
      inProductionCount,
      readyDeliveryCount,
      deliveredCount,
      todayPaymentsSum,
      allPaymentsSum,
      allDuesSum,
      totalExpensesSum,
      recentOrders,
      upcomingDeadlines,
      recentPayments,
      orderItems,
      allOrders
    ] = await Promise.all([
      prisma.order.count({ where: { orderDate: { gte: todayStart } } }),
      prisma.order.count({ where: { orderDate: { gte: startDate, lte: now } } }),
      prisma.order.count({ where: { productionStatus: 'PENDING' } }),
      prisma.order.count({ where: { productionStatus: 'IN_PRODUCTION' } }),
      prisma.order.count({ where: { productionStatus: 'READY_FOR_DELIVERY' } }),
      prisma.order.count({ where: { productionStatus: 'DELIVERED' } }),
      prisma.payment.aggregate({
        where: { paymentDate: { gte: todayStart } },
        _sum: { amount: true }
      }),
      prisma.payment.aggregate({
        where: { paymentDate: { gte: startDate, lte: now } },
        _sum: { amount: true }
      }),
      prisma.order.aggregate({
        where: { orderDate: { gte: startDate, lte: now } },
        _sum: { amountDue: true }
      }),
      prisma.expense.aggregate({
        where: { date: { gte: startDate, lte: now } },
        _sum: { amount: true }
      }),
      prisma.order.findMany({
        take: 6,
        include: { customer: true },
        orderBy: { orderDate: 'desc' }
      }),
      prisma.order.findMany({
        take: 5,
        where: {
          productionStatus: { notIn: ['DELIVERED', 'CANCELLED'] },
          deliveryDate: { not: null }
        },
        include: { customer: true },
        orderBy: { deliveryDate: 'asc' }
      }),
      prisma.payment.findMany({
        take: 5,
        include: { customer: true, order: true },
        orderBy: { paymentDate: 'desc' }
      }),
      prisma.orderItem.findMany({
        take: 100,
        select: { productName: true, productNameBn: true, quantity: true, subtotal: true }
      }),
      prisma.order.findMany({
        where: { orderDate: { gte: startDate, lte: now } },
        select: { totalAmount: true, amountPaid: true, amountDue: true, productionStatus: true, orderDate: true }
      })
    ]);

    const totalSales = allOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const totalPaymentsReceived = allPaymentsSum._sum.amount || 0;
    const totalOutstandingDue = allDuesSum._sum.amountDue || 0;
    const totalExpenses = totalExpensesSum._sum.amount || 0;
    const estimatedGrossProfit = totalSales - totalExpenses;
    const todaySales = allOrders
      .filter(o => new Date(o.orderDate) >= todayStart)
      .reduce((acc, o) => acc + o.totalAmount, 0);

    // Group Top Products
    const productStats: Record<string, { name: string; nameBn: string; count: number; revenue: number }> = {};
    for (const it of orderItems) {
      const key = it.productName;
      if (!productStats[key]) {
        productStats[key] = {
          name: it.productName,
          nameBn: it.productNameBn || it.productName,
          count: 0,
          revenue: 0
        };
      }
      productStats[key].count += it.quantity;
      productStats[key].revenue += it.subtotal;
    }
    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Monthly Sales Chart Data (last 6 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyDataMap: Record<string, { month: string; sales: number; payments: number; expenses: number }> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mKey = `${months[d.getMonth()]}`;
      monthlyDataMap[mKey] = { month: mKey, sales: 0, payments: 0, expenses: 0 };
    }

    for (const o of allOrders) {
      const m = months[new Date(o.orderDate).getMonth()];
      if (monthlyDataMap[m]) {
        monthlyDataMap[m].sales += o.totalAmount;
      }
    }

    const monthlyChart = Object.values(monthlyDataMap);

    // Order status distribution
    const statusDistribution = [
      { name: 'পেন্ডিং', key: 'PENDING', value: pendingOrdersCount, color: '#f59e0b' },
      { name: 'উৎপাদন চলছে', key: 'IN_PRODUCTION', value: inProductionCount, color: '#3b82f6' },
      { name: 'ডেলিভারির জন্য প্রস্তুত', key: 'READY_FOR_DELIVERY', value: readyDeliveryCount, color: '#10b981' },
      { name: 'ডেলিভারি সম্পন্ন', key: 'DELIVERED', value: deliveredCount, color: '#059669' }
    ];

    res.json({
      success: true,
      stats: {
        todayOrders: todayOrdersCount,
        rangeOrders: rangeOrdersCount,
        pendingOrders: pendingOrdersCount,
        inProduction: inProductionCount,
        readyForDelivery: readyDeliveryCount,
        deliveredOrders: deliveredCount,
        todaySales,
        todayPayments: todayPaymentsSum._sum.amount || 0,
        totalSales,
        totalPaymentsReceived,
        totalOutstandingDue,
        totalExpenses,
        estimatedGrossProfit
      },
      recentOrders,
      upcomingDeadlines,
      recentPayments,
      topProducts,
      monthlyChart,
      statusDistribution
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

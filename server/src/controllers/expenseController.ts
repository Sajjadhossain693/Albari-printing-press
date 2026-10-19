import { Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { generateCode } from '../utils/formatters.js';

export async function getExpenses(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { category, startDate, endDate, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (category && category !== 'ALL') {
      where.category = String(category);
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(String(startDate));
      if (endDate) where.date.lte = new Date(String(endDate));
    }

    const [expenses, total, sumResult] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take,
        include: { createdBy: { select: { fullName: true } } },
        orderBy: { date: 'desc' }
      }),
      prisma.expense.count({ where }),
      prisma.expense.aggregate({
        where,
        _sum: { amount: true }
      })
    ]);

    res.json({
      success: true,
      expenses,
      totalAmount: sumResult._sum.amount || 0,
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

export async function createExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { category, categoryBn, amount, paymentMethod, vendor, description, date, receiptAttachment } = req.body;
    const numAmount = parseFloat(amount);

    if (!category || isNaN(numAmount) || numAmount <= 0 || !description) {
      res.status(400).json({ success: false, message: 'Category, positive amount, and description are required' });
      return;
    }

    const userId = req.user?.userId || (await prisma.user.findFirst())?.id || 'system';

    const count = await prisma.expense.count();
    const expenseNumber = generateCode('EXP', count + 1);

    const expense = await prisma.expense.create({
      data: {
        expenseNumber,
        category,
        categoryBn: categoryBn || null,
        amount: numAmount,
        paymentMethod: paymentMethod || 'CASH',
        vendor: vendor || null,
        description,
        date: date ? new Date(date) : new Date(),
        receiptAttachment: receiptAttachment || null,
        createdById: userId,
        approved: true
      },
      include: {
        createdBy: { select: { fullName: true } }
      }
    });

    res.status(201).json({ success: true, expense });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteExpense(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    await prisma.expense.delete({ where: { id } });
    res.json({ success: true, message: 'Expense deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

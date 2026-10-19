import { Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getCustomers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { search, type, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 50;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { fullName: { contains: q } },
        { phone: { contains: q } },
        { customerCode: { contains: q } },
        { organizationName: { contains: q } }
      ];
    }
    if (type && type !== 'ALL') {
      where.customerType = String(type);
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take,
        include: {
          orders: {
            select: {
              totalAmount: true,
              amountPaid: true,
              amountDue: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.customer.count({ where })
    ]);

    // Calculate aggregated stats per customer
    const formatted = customers.map(c => {
      const totalOrders = c.orders.length;
      const totalSpent = c.orders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
      const totalPaid = c.orders.reduce((acc: number, o: any) => acc + o.amountPaid, 0);
      const currentDue = c.orders.reduce((acc: number, o: any) => acc + o.amountDue, 0);

      return {
        id: c.id,
        customerCode: c.customerCode,
        fullName: c.fullName,
        fullNameBn: c.fullNameBn,
        phone: c.phone,
        email: c.email,
        address: c.address,
        addressBn: c.addressBn,
        customerType: c.customerType,
        organizationName: c.organizationName,
        organizationNameBn: c.organizationNameBn,
        notes: c.notes,
        totalOrders,
        totalSpent,
        totalPaid,
        currentDue,
        createdAt: c.createdAt
      };
    });

    res.json({
      success: true,
      customers: formatted,
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

export async function getCustomerById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: true,
            payments: true
          }
        },
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    const totalSpent = customer.orders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
    const totalPaid = customer.orders.reduce((acc: number, o: any) => acc + o.amountPaid, 0);
    const currentDue = customer.orders.reduce((acc: number, o: any) => acc + o.amountDue, 0);

    res.json({
      success: true,
      customer: {
        ...customer,
        totalSpent,
        totalPaid,
        currentDue
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { fullName, fullNameBn, phone, email, address, addressBn, customerType, organizationName, notes } = req.body;
    if (!fullName || !phone) {
      res.status(400).json({ success: false, message: 'Full name and phone are required' });
      return;
    }

    const cleanPhone = phone.trim();
    const existing = await prisma.customer.findUnique({ where: { phone: cleanPhone } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Customer with this phone already exists', existingCustomer: existing });
      return;
    }

    const count = await prisma.customer.count();
    const customerCode = `CUST-${String(count + 1).padStart(4, '0')}`;

    const customer = await prisma.customer.create({
      data: {
        customerCode,
        fullName: fullName.trim(),
        fullNameBn: fullNameBn?.trim() || null,
        phone: cleanPhone,
        email: email?.trim().toLowerCase() || null,
        address: address?.trim() || null,
        addressBn: addressBn?.trim() || null,
        customerType: customerType || 'INDIVIDUAL',
        organizationName: organizationName?.trim() || null,
        notes: notes || null
      }
    });

    res.status(201).json({ success: true, customer });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { fullName, fullNameBn, phone, email, address, addressBn, customerType, organizationName, notes } = req.body;

    const updated = await prisma.customer.update({
      where: { id },
      data: {
        fullName,
        fullNameBn,
        phone,
        email,
        address,
        addressBn,
        customerType,
        organizationName,
        notes
      }
    });

    res.json({ success: true, customer: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function exportCustomersCsv(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: { select: { totalAmount: true, amountPaid: true, amountDue: true } }
      },
      orderBy: { customerCode: 'asc' }
    });

    let csv = 'Customer Code,Name,Phone,Email,Type,Organization,Address,Total Orders,Total Billed,Total Paid,Total Due\n';
    for (const c of customers) {
      const totalOrders = c.orders.length;
      const totalBilled = c.orders.reduce((acc: number, o: any) => acc + o.totalAmount, 0);
      const totalPaid = c.orders.reduce((acc: number, o: any) => acc + o.amountPaid, 0);
      const totalDue = c.orders.reduce((acc: number, o: any) => acc + o.amountDue, 0);

      csv += `"${c.customerCode}","${c.fullName}","${c.phone}","${c.email || ''}","${c.customerType}","${c.organizationName || ''}","${c.address || ''}",${totalOrders},${totalBilled},${totalPaid},${totalDue}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="albari-customers.csv"');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

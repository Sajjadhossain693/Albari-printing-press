import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { generateToken } from '../utils/token.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ success: false, message: 'Username and password are required' });
      return;
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.trim() },
          { email: username.trim().toLowerCase() },
          { phone: username.trim() }
        ]
      }
    });

    if (!user || !user.active) {
      res.status(401).json({ success: false, message: 'Invalid credentials or inactive account' });
      return;
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        fullNameBn: user.fullNameBn,
        role: user.role,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function registerCustomer(req: Request, res: Response): Promise<void> {
  try {
    const { fullName, phone, email, password, address, organizationName } = req.body;
    if (!fullName || !phone || !password) {
      res.status(400).json({ success: false, message: 'Full name, phone, and password are required' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: phone.trim() },
          ...(email ? [{ email: email.trim().toLowerCase() }] : [])
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'Account with this phone/email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        username: phone.trim(),
        email: email ? email.trim().toLowerCase() : null,
        passwordHash,
        fullName,
        phone,
        role: 'CUSTOMER'
      }
    });

    // Also link or create Customer record
    let customer = await prisma.customer.findUnique({
      where: { phone: phone.trim() }
    });

    if (!customer) {
      const count = await prisma.customer.count();
      const customerCode = `CUST-${String(count + 1).padStart(4, '0')}`;
      customer = await prisma.customer.create({
        data: {
          customerCode,
          fullName,
          phone: phone.trim(),
          email: email || null,
          address: address || null,
          organizationName: organizationName || null,
          customerType: organizationName ? 'BUSINESS' : 'INDIVIDUAL'
        }
      });
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
      email: user.email
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        customer
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        username: true,
        fullName: true,
        fullNameBn: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        avatar: true
      }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getStaffList(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: { in: ['OWNER', 'MANAGER', 'DESIGNER', 'STAFF'] }
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        fullNameBn: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ success: true, staff });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { username, password, fullName, fullNameBn, role, email, phone } = req.body;
    if (!username || !password || !fullName || !role) {
      res.status(400).json({ success: false, message: 'Required fields missing' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { username: username.trim() } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Username already taken' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        passwordHash,
        fullName,
        fullNameBn: fullNameBn || null,
        role,
        email: email || null,
        phone: phone || null
      }
    });

    res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        fullName: newUser.fullName,
        role: newUser.role
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { fullName, fullNameBn, role, phone, email, password, active } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'স্টাফ অ্যাকাউন্ট পাওয়া যায়নি' });
      return;
    }

    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = fullName;
    if (fullNameBn !== undefined) updateData.fullNameBn = fullNameBn;
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (active !== undefined) updateData.active = Boolean(active);

    if (password && password.trim()) {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(password.trim(), salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        fullName: true,
        fullNameBn: true,
        email: true,
        phone: true,
        role: true,
        active: true
      }
    });

    res.json({ success: true, user: updated, message: 'স্টাফের তথ্য সফলভাবে হালনাগাদ করা হয়েছে' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function deleteStaff(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (id === req.user?.userId) {
      res.status(400).json({ success: false, message: 'এডমিন নিজের অ্যাকাউন্ট মুছতে পারবেন না' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, message: 'স্টাফ অ্যাকাউন্ট পাওয়া যায়নি' });
      return;
    }

    const relatedOrdersCount = await prisma.order.count({
      where: {
        OR: [
          { createdById: id },
          { assignedDesignerId: id },
          { assignedStaffId: id }
        ]
      }
    });

    if (relatedOrdersCount > 0) {
      // Deactivate instead of hard delete to preserve foreign key history
      await prisma.user.update({
        where: { id },
        data: { active: false }
      });
      res.json({ success: true, message: 'স্টাফের পূর্ববর্তী কাজের রেকর্ড থাকায় অ্যাকাউন্টটি নিষ্ক্রিয় (Deactivated) করা হয়েছে' });
    } else {
      await prisma.user.delete({ where: { id } });
      res.json({ success: true, message: 'স্টাফ অ্যাকাউন্ট সফলভাবে মুছে ফেলা হয়েছে' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}


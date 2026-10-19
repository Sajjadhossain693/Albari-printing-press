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
          { email: username.trim().toLowerCase() }
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

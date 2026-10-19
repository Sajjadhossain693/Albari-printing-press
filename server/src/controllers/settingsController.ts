import { Request, Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getSettings(req: Request, res: Response): Promise<void> {
  try {
    let settings = await prisma.businessSettings.findFirst();
    if (!settings) {
      settings = await prisma.businessSettings.create({
        data: {
          name: 'Al-Bari Press & Digital Sign',
          nameBn: 'ছাপাখানা আল-বারী প্রেস এন্ড ডিজিটাল সাইন',
          address: "Mohammadia Hotel Lane, Opposite Hawker's Market, Maijdee, Noakhali",
          addressBn: 'মাইজদী মোহাম্মদীয়া হোটেলের সংলগ্ন গলি, হকার্স মার্কেটের বিপরীত সাইট, মাইজদী, নোয়াখালী',
          phone: '01618-182365',
          email: 'albariprintingpress@gmail.com',
          logoUrl: '/assets/albari-logo.jpg',
          currencySymbol: '৳',
          currencyCode: 'BDT',
          defaultLanguage: 'bn'
        }
      });
    }

    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      name, nameBn, address, addressBn, phone, email,
      currencySymbol, currencyCode, defaultLanguage, timezone,
      aiProvider, termsBn, termsEn
    } = req.body;

    const existing = await prisma.businessSettings.findFirst();
    let updated;

    if (existing) {
      updated = await prisma.businessSettings.update({
        where: { id: existing.id },
        data: {
          name, nameBn, address, addressBn, phone, email,
          currencySymbol, currencyCode, defaultLanguage, timezone,
          aiProvider, termsBn, termsEn
        }
      });
    } else {
      updated = await prisma.businessSettings.create({
        data: {
          name, nameBn, address, addressBn, phone, email,
          currencySymbol, currencyCode, defaultLanguage, timezone,
          aiProvider, termsBn, termsEn
        }
      });
    }

    res.json({ success: true, settings: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

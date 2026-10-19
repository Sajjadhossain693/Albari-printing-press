import { Request, Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { active: true },
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
    res.json({ success: true, categories });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const { category, search, activeOnly = 'true' } = req.query;
    const where: any = {};

    if (activeOnly === 'true') {
      where.active = true;
    }
    if (category) {
      where.category = { slug: String(category) };
    }
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { name: { contains: q } },
        { nameBn: { contains: q } },
        { description: { contains: q } },
        { descriptionBn: { contains: q } }
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function createProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      name, nameBn, categoryId, description, descriptionBn,
      basePrice, unit, unitBn, availableSizes, material, materialBn,
      printingOptions, finishingOptions, leadTimeDays, imageUrl
    } = req.body;

    if (!name || !nameBn || !categoryId) {
      res.status(400).json({ success: false, message: 'Name, Bengali Name, and Category are required' });
      return;
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const product = await prisma.product.create({
      data: {
        name,
        nameBn,
        slug,
        categoryId,
        description: description || null,
        descriptionBn: descriptionBn || null,
        basePrice: parseFloat(basePrice) || 0,
        unit: unit || 'PIECE',
        unitBn: unitBn || 'টি',
        availableSizes: availableSizes ? JSON.stringify(availableSizes) : null,
        material: material || null,
        materialBn: materialBn || null,
        printingOptions: printingOptions || null,
        finishingOptions: finishingOptions || null,
        leadTimeDays: parseInt(leadTimeDays, 10) || 3,
        imageUrl: imageUrl || null
      },
      include: { category: true }
    });

    res.status(201).json({ success: true, product });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateProduct(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const {
      name, nameBn, categoryId, description, descriptionBn,
      basePrice, unit, unitBn, availableSizes, material, materialBn,
      printingOptions, finishingOptions, leadTimeDays, imageUrl, active
    } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        nameBn,
        categoryId,
        description,
        descriptionBn,
        basePrice: basePrice !== undefined ? parseFloat(basePrice) : undefined,
        unit,
        unitBn,
        availableSizes: availableSizes ? JSON.stringify(availableSizes) : undefined,
        material,
        materialBn,
        printingOptions,
        finishingOptions,
        leadTimeDays: leadTimeDays !== undefined ? parseInt(leadTimeDays, 10) : undefined,
        imageUrl,
        active
      },
      include: { category: true }
    });

    res.json({ success: true, product: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

import { Response } from 'express';
import prisma from '../db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { AIDesignService } from '../services/aiDesignService.js';
import { generateCode } from '../utils/formatters.js';

export async function generateAIDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { prompt, category, aspectRatio, colorPalette, style, revisionPrompt } = req.body;

    if (!prompt || !category) {
      res.status(400).json({ success: false, message: 'Prompt and category are required' });
      return;
    }

    const result = await AIDesignService.generateArtwork({
      prompt,
      category,
      aspectRatio,
      colorPalette,
      style,
      revisionPrompt
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function getDesigns(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { category, status, search, customerId, page = '1', limit = '30' } = req.query;
    const pageNum = parseInt(page as string, 10) || 1;
    const take = parseInt(limit as string, 10) || 30;
    const skip = (pageNum - 1) * take;

    const where: any = {};
    if (category && category !== 'ALL') where.category = String(category);
    if (status && status !== 'ALL') where.status = String(status);
    if (customerId) where.customerId = String(customerId);
    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q } },
        { designCode: { contains: q } },
        { prompt: { contains: q } }
      ];
    }

    const [designs, total] = await Promise.all([
      prisma.designAsset.findMany({
        where,
        skip,
        take,
        include: {
          customer: { select: { id: true, fullName: true } },
          designer: { select: { id: true, fullName: true } },
          revisions: { orderBy: { revisionNumber: 'desc' } }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.designAsset.count({ where })
    ]);

    res.json({
      success: true,
      designs,
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

export async function saveDesign(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const {
      title,
      titleBn,
      category,
      customerId,
      orderId,
      prompt,
      artworkUrl,
      dimensions,
      colorMode,
      resolution,
      printSpecs
    } = req.body;

    if (!title || !artworkUrl || !category) {
      res.status(400).json({ success: false, message: 'Title, Artwork URL, and category are required' });
      return;
    }

    const userId = req.user?.userId || (await prisma.user.findFirst())?.id || 'system';

    const count = await prisma.designAsset.count();
    const designCode = generateCode('DSN', count + 1);

    const design = await prisma.designAsset.create({
      data: {
        designCode,
        title,
        titleBn: titleBn || null,
        category,
        customerId: customerId || null,
        orderId: orderId || null,
        designerId: userId,
        prompt: prompt || null,
        artworkUrl,
        status: 'IN_REVIEW',
        dimensions: dimensions || 'A4',
        colorMode: colorMode || 'CMYK',
        resolution: resolution || '300 DPI',
        printSpecs: printSpecs || null,
        revisions: {
          create: {
            revisionNumber: 1,
            artworkUrl,
            prompt: prompt || 'Initial design generation',
            submittedById: userId
          }
        }
      },
      include: {
        revisions: true
      }
    });

    res.status(201).json({ success: true, design });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

export async function updateDesignStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = String(req.params.id);
    const { status, notes } = req.body;

    const design = await prisma.designAsset.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined
      }
    });

    res.json({ success: true, design });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
}

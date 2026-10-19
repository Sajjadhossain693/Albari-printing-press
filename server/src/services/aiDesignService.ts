import fs from 'fs';
import path from 'path';

export interface GenerateDesignParams {
  prompt: string;
  category: string;
  aspectRatio?: '1:1' | '16:9' | '4:5' | '9:16' | '3:2' | '2:3';
  colorPalette?: string;
  style?: string;
  revisionPrompt?: string;
}

export class AIDesignService {
  private static getPresetForCategory(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes('crest') || cat.includes('medal') || cat.includes('trophy')) {
      return '/assets/crest-award-promo.jpg';
    }
    if (cat.includes('visiting') || cat.includes('business card')) {
      return '/assets/visiting-card-promo.jpg';
    }
    if (cat.includes('cash memo') || cat.includes('pad') || cat.includes('voucher')) {
      return '/assets/cash-memo-promo.jpg';
    }
    if (cat.includes('seal') || cat.includes('stamp')) {
      return '/assets/seal-stamp-promo.jpg';
    }
    if (cat.includes('brochure') || cat.includes('menu') || cat.includes('leaflet')) {
      return '/assets/restaurant-menu-brochure.jpg';
    }
    if (cat.includes('banner')) {
      return '/assets/eid-banner.jpg';
    }
    if (cat.includes('poster')) {
      return '/assets/waz-mahfil-posters.jpg';
    }
    if (cat.includes('doctor') || cat.includes('file')) {
      return '/assets/doctor-file-promo.jpg';
    }
    return '/assets/digital-print-machine.jpg';
  }

  public static async generateArtwork(params: GenerateDesignParams): Promise<{
    imageUrl: string;
    promptUsed: string;
    provider: string;
    metadata: Record<string, any>;
  }> {
    const provider = process.env.AI_PROVIDER || 'pollinations';

    // Enrich prompt with graphic design & printing specifications
    let fullPrompt = `${params.prompt}`;
    if (params.revisionPrompt) {
      fullPrompt += ` (Revision update: ${params.revisionPrompt})`;
    }
    if (params.colorPalette) {
      fullPrompt += `, Brand Colors: ${params.colorPalette}`;
    }
    if (params.style) {
      fullPrompt += `, Style: ${params.style}`;
    }
    fullPrompt += `, professional graphic design for high-resolution printing, CMYK ready, sharp typography, vector aesthetic, balanced layout`;

    try {
      if (provider === 'pollinations') {
        // Pollinations.ai provides direct high-resolution AI image synthesis
        let width = 1024;
        let height = 1024;

        if (params.aspectRatio === '16:9') {
          width = 1280;
          height = 720;
        } else if (params.aspectRatio === '4:5') {
          width = 1000;
          height = 1250;
        } else if (params.aspectRatio === '9:16' || params.aspectRatio === '2:3') {
          width = 720;
          height = 1280;
        }

        const encodedPrompt = encodeURIComponent(fullPrompt.slice(0, 400));
        const seed = Math.floor(Math.random() * 1000000);
        const generatedUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true&model=flux`;

        return {
          imageUrl: generatedUrl,
          promptUsed: fullPrompt,
          provider: 'pollinations (Flux)',
          metadata: {
            width,
            height,
            aspectRatio: params.aspectRatio || '1:1',
            seed
          }
        };
      }

      // Fallback or OpenAI / Gemini integrations when configured
      const fallbackUrl = this.getPresetForCategory(params.category);
      return {
        imageUrl: fallbackUrl,
        promptUsed: fullPrompt,
        provider: 'local-press-engine',
        metadata: {
          width: 1024,
          height: 1024,
          fallbackReason: 'Default local template engine'
        }
      };
    } catch (err: any) {
      // Graceful fallback to verified authentic Al-Bari press asset
      const fallbackUrl = this.getPresetForCategory(params.category);
      return {
        imageUrl: fallbackUrl,
        promptUsed: fullPrompt,
        provider: 'fallback',
        metadata: {
          error: err.message,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

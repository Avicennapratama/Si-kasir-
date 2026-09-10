/**
 * Studio domain types
 */

export interface StudioEnhanceRequest {
  businessId: string;
  image: string; // Base64
  style?: string;
}

export interface StudioCaptionRequest {
  businessId: string;
  productName: string;
  category: string;
  tone: 'ramah' | 'santai' | 'profesional' | 'semangat';
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'tiktok';
  keywords?: string[];
}

export interface StudioCaptionResponse {
  captions: [string, string, string];
  hashtags?: string[];
}

export interface StudioAssetRecord {
  id: string;
  businessId: string;
  originalMediaAssetId: string;
  resultMediaAssetId: string;
  status: 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}
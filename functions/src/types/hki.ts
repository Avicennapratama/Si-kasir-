/**
 * HKI domain types
 */

export interface HkiPreValuationRequest {
  businessId: string;
  brandName: string;
  category?: string;
  description?: string;
  creationDate?: string;
  evidence?: string[];
  usage?: string;
  targetMarket?: string;
}

export interface HkiValuationResult {
  valuationId: string;
  brandName: string;
  riskLevel: 'low' | 'medium' | 'high';
  uniquenessScore: number;
  suggestedClasses: string[];
  recommendations: string[];
  estimatedCost: number;
  confidence?: number;
  summary?: string;
  disclaimer?: string;
  createdAt: string;
}
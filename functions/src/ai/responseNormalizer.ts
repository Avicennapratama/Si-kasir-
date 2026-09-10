/**
 * AI Response Normalizer - ensures consistent output format
 */

import { ExtractedTransaction } from '../types/ai.js';

export const normalizeTransactionResponse = (raw: any): ExtractedTransaction => {
  const type = raw.type === 'income' || raw.type === 'expense' ? raw.type : null;
  const amount = typeof raw.amount === 'number' ? Math.round(raw.amount) : null;

  return {
    id: raw.id || `draft_${Date.now()}`,
    type,
    amount,
    vendor: typeof raw.vendor === 'string' ? raw.vendor : null,
    transactionDate: typeof raw.transactionDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.transactionDate)
      ? raw.transactionDate
      : null,
    notes: typeof raw.note === 'string' ? raw.note : (typeof raw.notes === 'string' ? raw.notes : null),
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({
          name: typeof item.name === 'string' ? item.name : '',
          qty: typeof item.qty === 'number' ? item.qty : null,
          price: typeof item.price === 'number' ? item.price : null,
        }))
      : [],
    confidence: typeof raw.confidence === 'number' ? Math.max(0, Math.min(1, raw.confidence)) : 0,
    lowConfidenceFields: Array.isArray(raw.lowConfidenceFields) ? raw.lowConfidenceFields : [],
    source: raw.source || 'manual',
    createdAt: new Date().toISOString(),
  };
};

export const normalizeCaptionResponse = (raw: any): string[] => {
  if (Array.isArray(raw.captions)) {
    return raw.captions.filter((c: any) => typeof c === 'string').slice(0, 3);
  }
  return [];
};

export const normalizeHKIResponse = (raw: any): any => ({
  valuationId: raw.valuationId || `hki_${Date.now()}`,
  brandName: typeof raw.brandName === 'string' ? raw.brandName : '',
  riskLevel: ['low', 'medium', 'high'].includes(raw.riskLevel) ? raw.riskLevel : 'medium',
  uniquenessScore: typeof raw.uniquenessScore === 'number' ? Math.round(Math.max(0, Math.min(100, raw.uniquenessScore))) : 0,
  suggestedClasses: Array.isArray(raw.suggestedClasses) ? raw.suggestedClasses.filter((c: any) => typeof c === 'string') : [],
  recommendations: Array.isArray(raw.recommendations) ? raw.recommendations.filter((r: any) => typeof r === 'string') : [],
  estimatedCost: typeof raw.estimatedCost === 'number' ? Math.max(0, Math.round(raw.estimatedCost)) : 0,
  confidence: typeof raw.confidence === 'number' ? Math.max(0, Math.min(1, raw.confidence)) : 0,
  summary: typeof raw.summary === 'string' ? raw.summary : '',
  disclaimer: typeof raw.disclaimer === 'string' ? raw.disclaimer : '',
  createdAt: new Date().toISOString(),
});
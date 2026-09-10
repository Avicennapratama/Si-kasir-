/**
 * Confidence Evaluator for AI extraction results
 * Evaluates confidence scores and flags fields that need attention
 */

export interface ConfidenceResult {
  overall: number;
  thresholds: {
    autoApprove: boolean;   // >= 0.95
    reviewNeeded: boolean;  // 0.80 - 0.94
    manualEntry: boolean;   // < 0.80
  };
  flags: Array<{
    field: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  suggestions: string[];
}

export const evaluateConfidence = (result: any): ConfidenceResult => {
  const confidence = typeof result.confidence === 'number' ? Math.max(0, Math.min(1, result.confidence)) : 0;

  const thresholds = {
    autoApprove: confidence >= 0.95,
    reviewNeeded: confidence >= 0.80 && confidence < 0.95,
    manualEntry: confidence < 0.80,
  };

  const flags: Array<{
    field: string;
    reason: string;
    severity: 'low' | 'medium' | 'high';
  }> = [];

  const suggestions: string[] = [];

  // Evaluate each field based on confidence patterns
  if (result.lowConfidenceFields && Array.isArray(result.lowConfidenceFields)) {
    for (const field of result.lowConfidenceFields) {
      flags.push({
        field,
        reason: `Field '${field}' has low confidence`,
        severity: field === 'amount' || field === 'type' ? 'high' : 'medium',
      });
      if (field === 'amount') {
        suggestions.push('Verify amount manually or re-scan receipt');
      }
      if (field === 'type') {
        suggestions.push('Re-evaluate whether transaction is income or expense');
      }
    }
  } else {
    // Default flags based on overall confidence
    if (confidence < 1.0) {
      if (result.type === null) {
        flags.push({
          field: 'type',
          reason: 'Transaction type could not be determined',
          severity: 'high',
        });
        suggestions.push('User should manually confirm transaction type');
      }
      if (result.amount === null) {
        flags.push({
          field: 'amount',
          reason: 'Amount could not be determined',
          severity: 'high',
        });
        suggestions.push('User should manually enter the amount');
      }
    }
  }

  // Additional suggestions based on overall confidence
  if (thresholds.reviewNeeded) {
    suggestions.push('Review extracted data before saving to transaction');
  }
  if (thresholds.manualEntry) {
    suggestions.push('Manual data entry recommended - AI extraction confidence too low');
  }

  return { overall: confidence, thresholds, flags, suggestions };
};
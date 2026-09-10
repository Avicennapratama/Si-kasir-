/**
 * PDF Template for HKI Pre-Valuation Report
 */

import adminSdk from 'firebase-admin';
// firebase-admin CJS + "type":"module": nilai runtime ada di .default,
// namespace tipe diimpor terpisah lewat 'import type'.
import type * as adminTypes from 'firebase-admin';
const admin = adminSdk;

export const generateHkiReportHtml = (valuation: any): string => {
  return `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
    .header { text-align: center; border-bottom: 2px solid #1a73e8; padding-bottom: 20px; margin-bottom: 30px; }
    .title { color: #1a73e8; font-size: 28px; margin: 0; }
    .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
    .section { margin-bottom: 25px; }
    .section-title { font-size: 18px; font-weight: bold; color: #1a73e8; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
    .row { display: flex; margin: 8px 0; }
    .label { font-weight: bold; width: 200px; flex-shrink: 0; }
    .value { flex: 1; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
    .badge-low { background: #e8f5e9; color: #2e7d32; }
    .badge-medium { background: #fff8e1; color: #f57f17; }
    .badge-high { background: #fdeaea; color: #c62828; }
    .list { margin: 10px 0; padding-left: 20px; }
    .list li { margin: 5px 0; }
    .disclaimer { background: #f5f5f5; padding: 15px; border-radius: 8px; font-size: 12px; color: #666; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="title">Laporan Pre-Valuasi HKI</h1>
    <div class="subtitle">SiKasir AI - Indikasi Awal Kekayaan Intelektual</div>
  </div>

  <div class="section">
    <div class="section-title">Ringkasan Eksekutif</div>
    <p>${valuation.summary || 'Tidak ada ringkasan tersedia.'}</p>
  </div>

  <div class="section">
    <div class="section-title">Informasi Dasar</div>
    <div class="row"><span class="label">Nama Brand:</span><span class="value">${valuation.brandName}</span></div>
    <div class="row"><span class="label">Skor Keunikan:</span><span class="value">${valuation.uniquenessScore}/100</span></div>
    <div class="row"><span class="label">Tingkat Risiko:</span><span class="value">
      <span class="badge ${valuation.riskLevel === 'low' ? 'badge-low' : valuation.riskLevel === 'medium' ? 'badge-medium' : 'badge-high'}">
        ${valuation.riskLevel.toUpperCase()}
      </span>
    </span></div>
    <div class="row"><span class="label">Kelas Saran:</span><span class="value">${valuation.suggestedClasses.join(', ') || '-'}</span></div>
    <div class="row"><span class="label">Biaya Estimasi:</span><span class="value">Rp ${valuation.estimatedCost.toLocaleString('id-ID')}</span></div>
  </div>

  <div class="section">
    <div class="section-title">Indikasi Orisinalitas</div>
    <p>${valuation.originalityIndication || '-'}</p>
  </div>

  <div class="section">
    <div class="section-title">Potensi Ekonomi</div>
    <p>${valuation.economicPotential || '-'}</p>
  </div>

  <div class="section">
    <div class="section-title">Tinjauan Bukti</div>
    <p>${valuation.evidenceReview || '-'}</p>
  </div>

  <div class="section">
    <div class="section-title">Informasi yang Kurang</div>
    <ul class="list">
      ${(valuation.missingInformation || []).map((item: string) => `<li>${item}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Checklist Pelengkapan</div>
    <ul class="list">
      ${(valuation.checklist || []).map((item: string) => `<li>${item}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">Rekomendasi</div>
    <ul class="list">
      ${(valuation.recommendations || []).map((item: string) => `<li>${item}</li>`).join('')}
    </ul>
  </div>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> ${valuation.disclaimer || 'Laporan ini bersifat indikatif dan bukan penilaian hukum resmi. Untuk keputusan hukum, silakan berkonsultasi dengan penasihat hukum atau DJKI.'}
  </div>

  <div class="footer">
    Dibuat pada: ${new Date().toLocaleString('id-ID')} | SiKasir AI Pre-Valuasi HKI
  </div>
</body>
</html>
  `.trim();
};
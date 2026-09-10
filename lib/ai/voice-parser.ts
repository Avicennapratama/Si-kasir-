/**
 * Parser transaksi suara bahasa Indonesia - 100% lokal, tanpa API berbayar.
 * Menghandle ekstraksi otomatis dari ucapan UMKM:
 * - "laku dua porsi mie ayam tiga puluh ribu" -> income, 30.000, Penjualan Produk
 * - "beli tepung lima kilo seratus dua puluh lima ribu" -> expense, 125.000, Bahan Baku
 * - "bayar listrik dua ratus ribu" -> expense, 200.000, Listrik & Air
 * - "omzet dua juta" -> income, 2.000.000, Penjualan Produk
 */

export interface VoiceParseResult {
  type: "income" | "expense";
  amount: number;
  note: string;
  category: string;
  items: Array<{ name: string; qty?: number; price?: number }>;
  confidence: number;
  lowConfidenceFields: string[];
  rawTranscript: string;
}

/**
 * Parsing teks deretan kata bilangan Indonesia ke integer
 */
function parseNumberSequence(words: string[]): number {
  let total = 0;
  let currentBlock = 0;
  let currDigit = 0;

  const digits: Record<string, number> = {
    nol: 0, kosong: 0,
    satu: 1, se: 1, dua: 2, tiga: 3, empat: 4,
    lima: 5, enam: 6, tujuh: 7, delapan: 8, sembilan: 9,
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i];

    if (digits[w] !== undefined) {
      currDigit = digits[w];
      // Jika kata selanjutnya adalah unit (ratus, puluh, belas), biarkan currDigit dipakai sebagai multiplier
      if (i + 1 < words.length && ["ratus", "puluh", "belas"].includes(words[i + 1])) {
        // do nothing, wait for next token
      } else {
        currentBlock += currDigit;
        currDigit = 0;
      }
    } else if (w === "seratus") {
      currentBlock += 100;
      currDigit = 0;
    } else if (w === "ratus") {
      currentBlock += (currDigit > 0 ? currDigit : 1) * 100;
      currDigit = 0;
    } else if (w === "sepuluh") {
      currentBlock += 10;
      currDigit = 0;
    } else if (w === "puluh") {
      currentBlock += (currDigit > 0 ? currDigit : 1) * 10;
      currDigit = 0;
    } else if (w === "sebelas") {
      currentBlock += 11;
      currDigit = 0;
    } else if (w === "belas") {
      currentBlock += (currDigit > 0 ? currDigit : 1) + 10;
      currDigit = 0;
    } else if (w === "seribu" || w === "ribu") {
      const mult = currentBlock > 0 ? currentBlock : (currDigit > 0 ? currDigit : 1);
      total += mult * 1000;
      currentBlock = 0;
      currDigit = 0;
    } else if (w === "sejuta" || w === "juta") {
      const mult = currentBlock > 0 ? currentBlock : (currDigit > 0 ? currDigit : 1);
      total += mult * 1000000;
      currentBlock = 0;
      currDigit = 0;
    }
  }

  total += currentBlock + currDigit;
  return total;
}

/**
 * Ekstrak nominal dari teks ucapan
 */
export function wordsToRupiah(text: string): number | null {
  if (!text) return null;
  const clean = text.toLowerCase().replace(/[,;!?"']/g, " ");

  // 1. Cek digit langsung: "150rb", "50k", "30000", "50.000", "2.5 juta"
  const digitMatch = clean.match(/(\d+[\d\.]*)\s*(k|rb|ribu|jt|juta)?\b/);
  if (digitMatch) {
    const rawVal = digitMatch[1].replace(/\./g, "");
    const unit = digitMatch[2];
    const base = parseFloat(rawVal);
    if (!isNaN(base) && base > 0) {
      if (unit === "k" || unit === "rb" || unit === "ribu") return Math.round(base * 1000);
      if (unit === "jt" || unit === "juta") return Math.round(base * 1000000);
      if (base >= 100) return Math.round(base);
    }
  }

  // 2. Cek kata-kata bilangan
  const wordTokens = clean.split(/\s+/);
  const numberKeywords = [
    "nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
    "sepuluh", "sebelas", "seratus", "seribu", "sejuta",
    "belas", "puluh", "ratus", "ribu", "juta",
  ];

  const numIndices: number[] = [];
  wordTokens.forEach((tok, idx) => {
    if (numberKeywords.includes(tok)) numIndices.push(idx);
  });

  if (numIndices.length === 0) return null;

  // Kelompokkan token angka berurutan
  const groups: number[][] = [];
  let currentGroup = [numIndices[0]];

  for (let i = 1; i < numIndices.length; i++) {
    if (numIndices[i] === currentGroup[currentGroup.length - 1] + 1) {
      currentGroup.push(numIndices[i]);
    } else {
      groups.push(currentGroup);
      currentGroup = [numIndices[i]];
    }
  }
  groups.push(currentGroup);

  // Prioritaskan grup yang mengandung unit moneter (ribu, juta, ratus)
  let targetWords: string[] | null = null;
  for (let i = groups.length - 1; i >= 0; i--) {
    const words = groups[i].map((idx) => wordTokens[idx]);
    if (words.some((w) => ["ribu", "seribu", "juta", "sejuta", "ratus", "seratus"].includes(w))) {
      targetWords = words;
      break;
    }
  }

  if (!targetWords) {
    // Jika tidak ada unit besar tapi grup terakhir berisi > 1 kata angka (misal "dua puluh")
    if (groups[groups.length - 1].length > 1) {
      targetWords = groups[groups.length - 1].map((idx) => wordTokens[idx]);
    } else {
      return null;
    }
  }

  const result = parseNumberSequence(targetWords);
  return result > 0 ? result : null;
}

/**
 * Ekstraksi kuantitas dan item dari transcript
 * contoh: "dua porsi mie ayam" -> qty: 2, item: "mie ayam"
 */
function extractItemDetails(transcript: string, type: "income" | "expense"): Array<{ name: string; qty?: number; price?: number }> {
  const clean = transcript.toLowerCase();
  // hapus kata-kata pemicu
  const scrubbed = clean
    .replace(/^(laku|beli|bayar|terima|jual|omzet)\s+/i, "")
    .replace(/(seratus|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh|sebelas|ribu|juta|ratus|puluh|belas|rb|k|\d+).*$/i, "")
    .trim();

  if (!scrubbed || scrubbed.length < 3) return [];

  // Cari deteksi qty seperti "2 porsi", "dua porsi", "5 kilo"
  const qtyMatch = scrubbed.match(/^(\d+|satu|dua|tiga|empat|lima|enam|tujuh|delapan|sembilan|sepuluh)\s*(porsi|kilo|kg|buah|biji|bungkus|pcs|gelas|mangkok|lembar)?\s*(.+)$/i);
  if (qtyMatch) {
    const rawQty = qtyMatch[1];
    const unitWord = qtyMatch[2] ? ` (${qtyMatch[2]})` : "";
    const itemName = qtyMatch[3].trim();
    const numMap: Record<string, number> = {
      satu: 1, dua: 2, tiga: 3, empat: 4, lima: 5,
      enam: 6, tujuh: 7, delapan: 8, sembilan: 9, sepuluh: 10,
    };
    const qty = parseInt(rawQty, 10) || numMap[rawQty] || 1;
    return [{ name: itemName ? itemName + unitWord : scrubbed, qty }];
  }

  return [{ name: scrubbed, qty: 1 }];
}

/**
 * Parser utama ucapan kasir UMKM
 */
export function parseIndonesianVoice(transcript: string): VoiceParseResult {
  const lower = transcript.toLowerCase().trim();
  const lowFields: string[] = [];

  // 1. Tipe Transaksi
  let type: "income" | "expense" = "income";
  const incomeWords = ["laku", "terima", "jual", "pendapatan", "masuk", "dapat", "omzet", "untung"];
  const expenseWords = ["beli", "bayar", "keluar", "gaji", "sewa", "belanja", "kulakan", "ongkir", "biaya"];

  const firstIncomeIdx = Math.min(
    ...incomeWords.map((w) => {
      const idx = lower.indexOf(w);
      return idx === -1 ? Infinity : idx;
    })
  );
  const firstExpenseIdx = Math.min(
    ...expenseWords.map((w) => {
      const idx = lower.indexOf(w);
      return idx === -1 ? Infinity : idx;
    })
  );

  if (firstIncomeIdx !== Infinity && firstExpenseIdx === Infinity) {
    type = "income";
  } else if (firstExpenseIdx !== Infinity && firstIncomeIdx === Infinity) {
    type = "expense";
  } else if (firstIncomeIdx !== Infinity && firstExpenseIdx !== Infinity) {
    type = firstIncomeIdx < firstExpenseIdx ? "income" : "expense";
  } else {
    // Default jika netral
    type = "income";
    lowFields.push("type");
  }

  // 2. Nominal Rupiah
  const amount = wordsToRupiah(lower);
  if (!amount) lowFields.push("amount");

  // 3. Kategori Heuristik
  let category = type === "income" ? "Penjualan Produk" : "Operasional";
  if (type === "expense") {
    if (/bahan|tepung|telur|minyak|daging|sayur|bumbu|beras|ayam|ikan|tahu|tempe|susu|kopi/i.test(lower)) {
      category = "Bahan Baku";
    } else if (/listrik|air|pdam|pln|wifi|internet|pulsa/i.test(lower)) {
      category = "Listrik & Air";
    } else if (/sewa|ruko|lapak|kios|kontrakan/i.test(lower)) {
      category = "Sewa Tempat";
    } else if (/gaji|karyawan|upah|bonus/i.test(lower)) {
      category = "Gaji Karyawan";
    } else if (/iklan|promo|sosmed|brosur/i.test(lower)) {
      category = "Pemasaran";
    }
  } else {
    if (/jasa|service|servis|potong|ongkos|reparasi|kursus/i.test(lower)) {
      category = "Pendapatan Jasa";
    } else if (/modal|investasi|pinjaman/i.test(lower)) {
      category = "Modal Tambahan";
    }
  }

  // 4. Catatan & Items
  const items = extractItemDetails(lower, type);
  let note = transcript.trim();
  if (items.length > 0 && items[0].name) {
    const prefix = type === "income" ? "Laku" : "Beli";
    note = `${prefix} ${items[0].name}`;
  }

  // 5. Confidence Calculation
  let confidence = 0.95;
  if (lowFields.includes("amount")) confidence -= 0.45;
  if (lowFields.includes("type")) confidence -= 0.2;
  if (!lower || lower.length < 5) confidence = 0.2;

  return {
    type,
    amount: amount || 0,
    note: note || (type === "income" ? "Penjualan Produk" : "Pengeluaran Usaha"),
    category,
    items,
    confidence: Math.max(0.1, Math.min(1.0, confidence)),
    lowConfidenceFields: lowFields,
    rawTranscript: transcript,
  };
}

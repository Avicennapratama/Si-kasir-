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
    } else if (w === "seribu" || w === "ribu" || w === "rebu") {
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

  // 1. Digit + satuan: "150rb", "1.5jt", "60 ribu", "2.5 juta", "50.000", "30000".
  //
  // Kumpulkan SEMUA kandidat lalu ambil yang terbesar. Dua bug lama diperbaiki:
  //   - "1.5jt" -> titik desimal dihapus dulu, jadi terbaca 15jt (10x lipat).
  //   - "beli 5 kilo tepung 60 ribu" -> regex lama berhenti di "5" dan
  //     menganggap "k" (dari "kilo") sebagai satuan ribuan, hasilnya Rp1.000.
  const UNIT: Record<string, number> = { k: 1e3, rb: 1e3, ribu: 1e3, jt: 1e6, juta: 1e6 };
  const digitCandidates: number[] = [];
  // Alternatif pertama = format ribuan Indonesia ("2.000.000").
  const re = /(\d{1,3}(?:\.\d{3})+|\d+(?:[.,]\d+)?)\s*(k|rb|ribu|jt|juta)?(?![a-z])/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean)) !== null) {
    const raw = m[1];
    const unit = m[2];
    let base: number;
    if (unit) {
      base = parseFloat(raw.replace(",", "."));      // "1.5jt" / "1,5jt"
    } else {
      base = parseFloat(raw.replace(/[.,]/g, ""));   // "50.000" -> 50000
      if (base < 100) continue;                      // angka telanjang kecil = qty, bukan nominal
    }
    if (!isFinite(base) || base <= 0) continue;
    digitCandidates.push(Math.round(base * (unit ? UNIT[unit] : 1)));
  }
  if (digitCandidates.length) return Math.max(...digitCandidates);

  // 2. Cek kata-kata bilangan
  const wordTokens = clean.split(/\s+/);
  const numberKeywords = [
    "nol", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan",
    "sepuluh", "sebelas", "seratus", "seribu", "sejuta",
    "belas", "puluh", "ratus", "ribu", "juta", "rebu",
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
    if (words.some((w) => ["ribu", "seribu", "rebu", "juta", "sejuta", "ratus", "seratus"].includes(w))) {
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
  const expenseWords = ["beli", "bayar", "keluar", "gaji", "sewa", "belanja", "kulakan", "ongkir", "biaya", "restock", "stok", "kulak"];

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

  // "ada yang beli" = pelanggan yang membeli, jadi PEMASUKAN bagi pemilik
  // warung — bukan pengeluaran. Tanpa ini, kata "beli" menyesatkan parser.
  if (/(ada yang beli|yang beli|ada beli|pembeli|pelanggan beli|dibeli)/.test(lower)) {
    type = "income";
    const i = lowFields.indexOf("type");
    if (i !== -1) lowFields.splice(i, 1);
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

  // 5. Confidence JUJUR.
  //
  // Versi lama selalu mulai dari 0.95 dan hanya turun kalau amount/type tidak
  // ada. Akibatnya 80% kegagalannya dilaporkan "Akurasi Tinggi" walau nilainya
  // ngawur (mis. "kulakan 1.5jt" -> Rp15.000.000, "dua lima" -> Rp7), sehingga
  // user menekan Konfirmasi tanpa memeriksa dan error masuk pembukuan.
  // Sekarang sinyal rapuh yang benar-benar ada ditandai.
  let confidence = 0.95;
  const hasUnit = /(ribu|rebu|rb|juta|jt|ratus)/.test(lower);
  const hasDigit = /\d/.test(lower);

  if (!amount) {
    confidence = 0.35;
    lowFields.push("amount");
  } else if (amount < 1000) {
    // Nominal di bawah Rp1.000 hampir pasti salah baca, bukan transaksi asli.
    confidence = 0.35;
    lowFields.push("amount");
  } else if (!hasDigit && !hasUnit) {
    // Angka murni dari kata bilangan tanpa satuan -> ambigu ("dua lima"
    // bisa berarti 25 atau 25000). Manusia pun tidak bisa memastikan.
    confidence = 0.6;
    lowFields.push("amount");
  }

  if (lowFields.includes("type")) confidence = Math.min(confidence, 0.7);
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

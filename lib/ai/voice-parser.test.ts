/**
 * Self-check parser suara (jalankan: npx ts-node --compilerOptions '{"module":"commonjs"}' lib/ai/voice-parser.test.ts)
 * Atau verifikasi manual: npx tsc --noEmit
 */
import { parseIndonesianVoice, wordsToRupiah } from "./voice-parser";

let pass = 0;
let fail = 0;

function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (ok) {
    pass++;
  } else {
    fail++;
    console.error(`FAIL: ${name}`);
    console.error(`  expected: ${JSON.stringify(expected)}`);
    console.error(`  actual:   ${JSON.stringify(actual)}`);
  }
}

// ---- Test wordsToRupiah ----
check("digit langsung 30000", wordsToRupiah("laku mie ayam 30000"), 30000);
check("digit + ribu", wordsToRupiah("beli tepung 50 ribu"), 50000);
check("digit k", wordsToRupiah("terima 50k"), 50000);
check("teks: tiga puluh ribu", wordsToRupiah("tiga puluh ribu"), 30000);
check("teks: seratus dua puluh lima ribu", wordsToRupiah("seratus dua puluh lima ribu"), 125000);
check("teks: dua ratus ribu", wordsToRupiah("dua ratus ribu"), 200000);
check("teks: lima ratus ribu", wordsToRupiah("lima ratus ribu"), 500000);
check("teks: dua juta", wordsToRupiah("omzet dua juta"), 2000000);
check("teks: dua puluh lima ribu", wordsToRupiah("dua puluh lima ribu"), 25000);
check("teks: satu juta lima ratus ribu", wordsToRupiah("satu juta lima ratus ribu"), 1500000);
check("tanpa nominal", wordsToRupiah("laku mie ayam"), null);
check("zero guard", wordsToRupiah("nol"), null);

// ---- Test parseIndonesianVoice ----
const t1 = parseIndonesianVoice("Laku dua porsi mie ayam tiga puluh ribu");
check("t1 type", t1.type, "income");
check("t1 amount", t1.amount, 30000);
check("t1 category", t1.category, "Penjualan Produk");

const t2 = parseIndonesianVoice("Beli tepung lima kilo seratus dua puluh lima ribu");
check("t2 type", t2.type, "expense");
check("t2 amount", t2.amount, 125000);
check("t2 category", t2.category, "Heuristik kategori Bahan Baku".includes("Bahan") ? "Bahan Baku" : "Bahan Baku");

const t3 = parseIndonesianVoice("Bayar listrik dua ratus ribu");
check("t3 type", t3.type, "t3".length === 2 ? "expense" : "expense");
check("t3 amount", t3.amount, 200000);
check("t3 category", t3.category, "Listrik & Air");

const t4 = parseIndonesianVoice("Terima pesanan kue lima ratus ribu");
check("terima = income", t4.type, "income");
check("terima amount", t4.amount, 500000);

const t5 = parseIndonesianVoice("Gaji karyawan satu juta lima ratus ribu");
check("gaji = expense", t5.type, "expense");
check("gaji amount", t5.amount, 1500000);
check("gaji category", t5.category, "Gaji Karyawan");

const t6 = parseIndonesianVoice("Uang masuk 150rb");
check("masuk 150rb type", t6!.type, "income");
check("masuk 150rb amount", t6!.amount, 150000);

const t7 = parseIndonesianVoice("halo selamat pagi");
check("netral default income", t7.type, "income");
check("netral lowFields ada type", t7.lowConfidenceFields.includes("type"), true);

console.log(`\nHasil: ${pass} pass, ${fail} fail`);
process.exit(fail > 0 ? 1 : 0);
"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Camera, 
  Upload, 
  Sparkles, 
  ArrowLeft, 
  Copy, 
  Check, 
  Download, 
  Share2, 
  Sliders, 
  RefreshCw, 
  Wand2, 
  Tag, 
  Layers, 
  Smartphone, 
  Instagram, 
  MessageCircle, 
  Store,
  ChevronRight,
  Sun,
  Eye
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { compressImage } from "@/lib/utils/image-compression";

// 4 Pilihan Preset Studio sesuai spec 11-STUDIO-FOTO.md
interface StudioPreset {
  id: string;
  name: string;
  subtitle: string;
  gradient: string;
  filter: string;
  borderGlow: string;
  lightingType: "warm" | "cool" | "ambient" | "pastel";
  iconLabel: string;
}

const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: "wood",
    name: "Meja Kayu Estetik",
    subtitle: "Warm rustic café ambiance",
    gradient: "from-amber-950/40 via-amber-900/10 to-transparent",
    filter: "contrast(1.08) saturate(1.15) brightness(1.03) sepia(0.08)",
    borderGlow: "border-amber-600/40",
    lightingType: "warm",
    iconLabel: "🪵",
  },
  {
    id: "marble",
    name: "Marmer Mewah Minimalis",
    subtitle: "Clean luxury stone lighting",
    gradient: "from-slate-800/30 via-slate-900/10 to-transparent",
    filter: "contrast(1.12) saturate(1.02) brightness(1.06)",
    borderGlow: "border-cyan-400/40",
    lightingType: "cool",
    iconLabel: "🏛️",
  },
  {
    id: "garden",
    name: "Taman Tropis Outdoor",
    subtitle: "Fresh natural sunny daylight",
    gradient: "from-emerald-950/40 via-teal-900/10 to-transparent",
    filter: "contrast(1.06) saturate(1.22) brightness(1.04)",
    borderGlow: "border-emerald-500/40",
    lightingType: "ambient",
    iconLabel: "🌿",
  },
  {
    id: "pastel",
    name: "Warna Pastel Cerah",
    subtitle: "Vibrant social media pop",
    gradient: "from-rose-950/30 via-orange-950/10 to-transparent",
    filter: "contrast(1.05) saturate(1.18) brightness(1.08)",
    borderGlow: "border-orange-400/40",
    lightingType: "pastel",
    iconLabel: "🎨",
  },
];

// Tone Caption sesuai spec & AI Prompts
type CaptionTone = "ramah" | "promo" | "elegan" | "informatif";
type SocialPlatform = "whatsapp" | "instagram" | "tiktok";

interface GeneratedCaption {
  id: number;
  text: string;
  charCount: number;
}

export default function StudioPage() {
  const router = useRouter();
  const { business } = useAuth();

  // Step state (1: Upload & Config, 2: Hasil & Preview)
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  // Form input state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState(business?.category || "Kuliner");
  const [selectedPreset, setSelectedPreset] = useState<string>("wood");
  const [selectedTone, setSelectedTone] = useState<CaptionTone>("ramah");
  const [selectedPlatform, setSelectedPlatform] = useState<SocialPlatform>("whatsapp");

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processProgress, setProcessProgress] = useState(0);

  // Result state
  const [enhancedDataUrl, setEnhancedDataUrl] = useState<string | null>(null);
  const [captions, setCaptions] = useState<GeneratedCaption[]>([]);
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [compareMode, setCompareMode] = useState<"enhanced" | "original" | "split">("enhanced");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Bersihkan preview object URL saat unmount
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle pilih file / foto
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Silakan pilih file format gambar (JPG/PNG).");
      return;
    }

    try {
      // Kompres via HTML5 Canvas agar ringan di memori HP
      const compressed = await compressImage(file, 1400, 0.85);
      setImageFile(file);
      setImagePreview(compressed.dataUrl);

      // Auto-suggest nama jika belum diisi
      if (!productName) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]/g, " ")
          .trim();
        if (cleanName && cleanName.length > 2 && !cleanName.toLowerCase().startsWith("image")) {
          setProductName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
        }
      }
    } catch (err) {
      console.error("Gagal kompres gambar:", err);
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Generate captions menggunakan prompt template lokal sesuai AI_PROMPTS.md
  const generateLocalCaptions = (name: string, cat: string, tone: CaptionTone, platform: SocialPlatform) => {
    const shop = business?.name || "toko kami";
    const pName = name || "Produk Pilihan";

    let resultCaptions: string[] = [];
    let tags: string[] = [];

    switch (tone) {
      case "ramah":
        resultCaptions = [
          `${pName} hangat dan istimewa dari ${shop} siap menemani harimu! Dibuat dengan bahan pilihan dan penuh cinta. Yuk cobain sekarang!`,
          `Lagi cari yang enak dan pas buat kumpul bareng? ${pName} solusinya. Pesan langsung lewat chat ya, kami siap layani!`,
          `Hari ini lebih ceria bareng ${pName}. Rasanya juara, porsinya pas, dan pastinya ramah di kantong. Yuk pesan sebelum kehabisan!`,
        ];
        break;
      case "promo":
        resultCaptions = [
          `🔥 PROMO SPESIAL HARI INI! Dapatkan ${pName} berkualitas dengan penawaran terbaik hanya di ${shop}. Jangan sampai terlewat!`,
          `Hemat banget! Beli ${pName} sekarang dan nikmati sensasi kualitas terbaiknya. Stok terbatas, yuk amankan porsi kamu sekarang!`,
          `Mau hemat tapi tetap puas? Pilih ${pName} dari ${shop}! Pesan hari ini dan rasakan bedanya. Hubungi kami sekarang!`,
        ];
        break;
      case "elegan":
        resultCaptions = [
          `Keanggunan rasa dalam setiap sajian. Hadirkan ${pName} berkualitas premium untuk melengkapi momen istimewa Anda bersama ${shop}.`,
          `Diciptakan dengan dedikasi dan standar terbaik, ${pName} memberikan pengalaman yang tak terlupakan. Eksklusif untuk Anda.`,
          `Sentuhan kemewahan yang autentik. Temukan keunikan dan kesempurnaan cita rasa ${pName} hanya di ${shop}.`,
        ];
        break;
      case "informatif":
        resultCaptions = [
          `Tahukah Anda? ${pName} dari ${shop} diproduksi higienis setiap hari dengan standar mutu terjaga. Pilihan tepat untuk konsumsi harian keluarga.`,
          `Mengenal ${pName}: Perpaduan bahan berkualitas dan resep pilihan yang menghasilkan kualitas terbaik. Tersedia setiap hari di ${shop}.`,
          `${pName} siap memenuhi kebutuhan harian Anda dengan proses bersih, cepat, dan rasa terpercaya. Pesan sekarang melalui kontak kami.`,
        ];
        break;
    }

    if (platform === "whatsapp") {
      tags = ["#UMKMIndonesia", "#ProdukLokal", "#PesanSekarang"];
    } else if (platform === "instagram") {
      tags = ["#kulinerlokal", "#umkmbisa", "#produklokal", "#katalogumkm", "#banggabuatanindonesia"];
    } else {
      tags = ["#fyp", "#racunshopee", "#kulinerindonesia", "#viralindonesia", "#produkviral"];
    }

    return { resultCaptions, tags };
  };

  // Render filter studio ke Canvas nyata untuk hasil unduhan HD
  const processImageToCanvas = async (presetId: string, srcUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(srcUrl);
          return;
        }

        canvas.width = img.naturalWidth || 1200;
        canvas.height = img.naturalHeight || 1200;

        // Apply filter string sesuai preset
        const preset = STUDIO_PRESETS.find((p) => p.id === presetId) || STUDIO_PRESETS[0];
        ctx.filter = preset.filter;

        // Gambar foto produk
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Tambah soft vignette / ambient studio overlay
        const gradient = ctx.createRadialGradient(
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.3,
          canvas.width / 2,
          canvas.height / 2,
          canvas.width * 0.75
        );

        if (preset.lightingType === "warm") {
          gradient.addColorStop(0, "rgba(255, 235, 205, 0.04)");
          gradient.addColorStop(1, "rgba(40, 20, 5, 0.35)");
        } else if (preset.lightingType === "cool") {
          gradient.addColorStop(0, "rgba(230, 245, 255, 0.05)");
          gradient.addColorStop(1, "rgba(10, 20, 35, 0.35)");
        } else if (preset.lightingType === "ambient") {
          gradient.addColorStop(0, "rgba(240, 255, 240, 0.04)");
          gradient.addColorStop(1, "rgba(10, 35, 25, 0.35)");
        } else {
          gradient.addColorStop(0, "rgba(255, 240, 245, 0.05)");
          gradient.addColorStop(1, "rgba(35, 15, 25, 0.32)");
        }

        ctx.filter = "none";
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        resolve(dataUrl);
      };
      img.src = srcUrl;
    });
  };

  // Submit generate foto & caption
  const handleGenerate = async () => {
    if (!imagePreview) {
      alert("Silakan pilih atau ambil foto produk terlebih dahulu.");
      return;
    }

    setIsProcessing(true);
    setProcessProgress(20);

    try {
      // Step 1: Canvas render
      setProcessProgress(50);
      const enhanced = await processImageToCanvas(selectedPreset, imagePreview);
      setEnhancedDataUrl(enhanced);

      // Step 2: Generate caption prompt
      setProcessProgress(80);
      await new Promise((r) => setTimeout(r, 600)); // Smooth UI transition
      const { resultCaptions, tags } = generateLocalCaptions(
        productName,
        productCategory,
        selectedTone,
        selectedPlatform
      );

      setCaptions(
        resultCaptions.map((text, idx) => ({
          id: idx + 1,
          text,
          charCount: text.length,
        }))
      );
      setHashtags(tags);

      setProcessProgress(100);
      setTimeout(() => {
        setIsProcessing(false);
        setActiveStep(2);
      }, 300);
    } catch (err) {
      console.error("Gagal generate studio:", err);
      setIsProcessing(false);
      alert("Gagal memproses foto studio. Silakan coba lagi.");
    }
  };

  // Salin caption ke clipboard
  const handleCopyCaption = (text: string, idx: number) => {
    const fullText = `${text}\n\n${hashtags.join(" ")}`;
    navigator.clipboard.writeText(fullText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Salin hashtags
  const handleCopyHashtags = () => {
    navigator.clipboard.writeText(hashtags.join(" "));
    setCopiedHashtags(true);
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  // Unduh foto hasil studio HD
  const handleDownloadImage = () => {
    if (!enhancedDataUrl) return;
    const link = document.createElement("a");
    link.href = enhancedDataUrl;
    link.download = `sikasir_studio_${(productName || "produk").toLowerCase().replace(/\s+/g, "_")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-[#090A0F] text-slate-100 px-4 sm:px-5 pt-6 pb-28 max-w-md mx-auto relative overflow-hidden">
      {/* Hidden Canvas untuk proses pixel rendering */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Ambient Flare */}
      <div
        className="absolute top-[-90px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full pointer-events-none blur-[130px] opacity-15"
        style={{
          background: "radial-gradient(circle, #FF8918 0%, #DA4E24 50%, transparent 80%)",
        }}
      />

      {/* Header Top Bar */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <button
          type="button"
          onClick={() => {
            if (activeStep === 2) {
              setActiveStep(1);
            } else {
              router.push("/ekraf");
            }
          }}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-bold text-white">Studio Foto Produk AI</h1>
          <p className="text-[11px] text-slate-400">
            {activeStep === 1 ? "1. Setup & Upload" : "2. Hasil Studio & Caption"}
          </p>
        </div>
        <div className="w-10" />
      </div>

      {/* ============================================================ */}
      {/* TAHAP 1: INPUT, UPLOAD & ATUR PRESET                        */}
      {/* ============================================================ */}
      {activeStep === 1 && (
        <div className="space-y-6 relative z-10">
          {/* Section 1: Upload Foto */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                1. Unggah Foto Produk Mentah
              </label>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-orange-400 hover:underline"
                >
                  Ganti Foto
                </button>
              )}
            </div>

            {/* Dropzone Box */}
            <div
              onClick={() => {
                if (!imagePreview) fileInputRef.current?.click();
              }}
              className={`relative rounded-3xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center ${
                imagePreview
                  ? "border-white/20 bg-black/40 h-64"
                  : "border-white/10 bg-white/[0.02] hover:border-orange-500/40 hover:bg-orange-500/[0.02] h-52 cursor-pointer"
              }`}
            >
              {imagePreview ? (
                <div className="relative w-full h-full flex items-center justify-center p-2">
                  <img
                    src={imagePreview}
                    alt="Preview produk mentah"
                    className="max-h-full max-w-full object-contain rounded-2xl"
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] text-slate-300">
                    <span className="truncate max-w-[200px]">{imageFile?.name || "Foto siap"}</span>
                    <span className="text-emerald-400 font-semibold">Terkonfirmasi ✓</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center p-5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/10 to-rose-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-3 shadow-[0_0_15px_rgba(255,137,24,0.1)]">
                    <Camera className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-semibold text-white mb-1">
                    Ketuk untuk memilih foto produk
                  </p>
                  <p className="text-xs text-slate-400 max-w-[240px] leading-relaxed">
                    Foto di meja biasa, cahaya cukup. AI akan memoles latar &amp; pencahayaannya.
                  </p>
                </div>
              )}
            </div>

            {/* Dual Action Upload Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mt-2.5">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="h-11 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Camera className="w-4 h-4 text-orange-400" />
                <span>Kamera Langsung</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="h-11 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Pilih dari Galeri</span>
              </button>
            </div>
          </div>

          {/* Section 2: Info Produk */}
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Nama Produk / Menu
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="Contoh: Kopi Susu Gula Aren, Keripik Pisang..."
                className="w-full h-11 px-3.5 rounded-xl bg-black/50 border border-white/[0.08] focus:border-orange-500/50 text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Kategori Usaha
              </label>
              <div className="grid grid-cols-3 gap-2">
                {["Kuliner", "Kriya / Fashion", "Jasa & Lainnya"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setProductCategory(cat)}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      productCategory === cat
                        ? "bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-[0_0_10px_rgba(255,137,24,0.15)]"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Pilih Gaya Studio */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              2. Pilih Suasana Studio
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {STUDIO_PRESETS.map((preset) => {
                const isSelected = selectedPreset === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => setSelectedPreset(preset.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] relative overflow-hidden ${
                      isSelected
                        ? `bg-white/[0.05] ${preset.borderGlow} shadow-[0_0_20px_rgba(255,137,24,0.15)]`
                        : "bg-white/[0.02] border-white/[0.06] hover:border-white/10"
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{preset.iconLabel}</div>
                    <div className="text-xs font-bold text-white mb-0.5">{preset.name}</div>
                    <div className="text-[10px] text-slate-400 leading-tight">
                      {preset.subtitle}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-slate-950 text-[10px] font-bold">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Tone Caption & Target Platform */}
          <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/[0.06] space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                3. Nada Bicara Caption
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: "ramah", label: "Santai & Ramah", desc: "Hangat bersahabat" },
                    { id: "promo", label: "Promo & Diskon", desc: "Ajak beli sekarang" },
                    { id: "elegan", label: "Elegan & Mewah", desc: "Kesan premium" },
                    { id: "informatif", label: "Informatif", desc: "Fokus mutu & proses" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTone(t.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      selectedTone === t.id
                        ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                        : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{t.label}</div>
                    <div className="text-[10px] text-slate-400">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Target Media Sosial
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
                  { id: "instagram", label: "Instagram", icon: Instagram },
                  { id: "tiktok", label: "TikTok", icon: Smartphone },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedPlatform === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPlatform(item.id as SocialPlatform)}
                      className={`h-9 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                        isSelected
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                          : "bg-white/[0.02] border-white/[0.06] text-slate-400"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Button: Generate */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!imagePreview || isProcessing}
            className={`w-full h-13 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              !imagePreview || isProcessing
                ? "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
                : "bg-gradient-to-r from-orange-500 to-rose-600 text-white shadow-[0_0_25px_rgba(255,137,24,0.35)] hover:shadow-[0_0_35px_rgba(255,137,24,0.5)] cursor-pointer"
            }`}
          >
            {isProcessing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Memoles Foto &amp; Meracik Caption... {processProgress}%</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Sulap Foto &amp; Buat Caption Sekarang</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* TAHAP 2: PRATINJAU HASIL & EXPORT                            */}
      {/* ============================================================ */}
      {activeStep === 2 && enhancedDataUrl && (
        <div className="space-y-6 relative z-10 animate-in fade-in duration-300">
          {/* Header Status Sukses */}
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-300">
                Foto Studio &amp; Caption Siap Jual!
              </div>
              <div className="text-[11px] text-slate-400">
                Siap diunduh untuk WhatsApp Story, Instagram Feed, atau TikTok.
              </div>
            </div>
          </div>

          {/* Hero Visual Preview: Before / After */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pratinjau Hasil Studio
              </label>
              {/* Toggle Mode Bandingkan */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCompareMode("enhanced")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                    compareMode === "enhanced"
                      ? "bg-orange-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Studio AI
                </button>
                <button
                  type="button"
                  onClick={() => setCompareMode("original")}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all ${
                    compareMode === "original"
                      ? "bg-white/20 text-white"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Foto Asli
                </button>
              </div>
            </div>

            {/* Container Gambar */}
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl flex items-center justify-center min-h-[280px]">
              <img
                src={compareMode === "original" && imagePreview ? imagePreview : enhancedDataUrl}
                alt="Hasil Studio Foto"
                className="max-h-[380px] w-full object-contain"
              />

              {/* Tag Sudut */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-wide">
                {compareMode === "original" ? "📷 Foto Mentah" : "✨ Studio AI Enhanced"}
              </div>

              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-[10px] text-slate-300 font-mono">
                {STUDIO_PRESETS.find((p) => p.id === selectedPreset)?.name}
              </div>
            </div>

            {/* Tombol Unduh Foto */}
            <button
              type="button"
              onClick={handleDownloadImage}
              className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/[0.12] hover:bg-white/[0.08] text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-[0_0_15px_rgba(255,255,255,0.05)]"
            >
              <Download className="w-4 h-4 text-orange-400" />
              <span>Unduh Foto Studio HD (.JPG)</span>
            </button>
          </div>

          {/* Section: 3 Pilihan Caption AI */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Pilihan Caption Promosi (Tone: {selectedTone})
              </label>
              <span className="text-[10px] text-orange-400 font-medium">
                Pilih 1 untuk disalin
              </span>
            </div>

            {captions.map((cap) => (
              <div
                key={cap.id}
                className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] hover:border-white/15 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/[0.05] text-slate-400">
                    Opsi {cap.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCaption(cap.text, cap.id)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                      copiedIndex === cap.id
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-orange-500/10 text-orange-400 border border-orange-500/30 hover:bg-orange-500/20"
                    }`}
                  >
                    {copiedIndex === cap.id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin Teks</span>
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed italic">
                  &ldquo;{cap.text}&rdquo;
                </p>
              </div>
            ))}
          </div>

          {/* Section: Hashtags Pintar */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>Rekomendasi Hashtag</span>
              </div>
              <button
                type="button"
                onClick={handleCopyHashtags}
                className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1"
              >
                {copiedHashtags ? "Tersalin! ✓" : "Salin Semua Tag"}
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hashtags.map((h, i) => (
                <span
                  key={i}
                  className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Action: Buat Foto Baru */}
          <button
            type="button"
            onClick={() => setActiveStep(1)}
            className="w-full h-12 rounded-2xl border border-white/[0.08] bg-transparent text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Buat Foto Produk Lain</span>
          </button>
        </div>
      )}
    </main>
  );
}

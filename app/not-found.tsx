import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">404</h2>
      <p className="text-slate-500 mb-6">Halaman tidak ditemukan.</p>
      <Link
        href="/"
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
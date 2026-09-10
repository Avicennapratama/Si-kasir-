'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-xl font-bold text-slate-800 mb-2">Terjadi Kesalahan!</h2>
      <p className="text-sm text-slate-500 mb-4">{error.message || 'Terjadi kesalahan pada sistem.'}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition"
      >
        Coba Lagi
      </button>
    </div>
  );
}
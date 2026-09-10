'use client';

import React from 'react';
import { useOffline } from '@/components/providers/OfflineProvider';

export function OfflineBanner() {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white text-xs font-semibold py-1.5 px-4 text-center">
      Anda sedang offline. Data akan disinkronkan secara otomatis saat terhubung kembali.
    </div>
  );
}
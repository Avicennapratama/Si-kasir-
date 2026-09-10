import React from 'react';

interface SyncStatusBadgeProps {
  status: 'synced' | 'pending' | 'error';
}

export function SyncStatusBadge({ status }: SyncStatusBadgeProps) {
  const badgeColors = {
    synced: 'bg-emerald-100 text-emerald-800',
    pending: 'bg-amber-100 text-amber-800',
    error: 'bg-rose-100 text-rose-800',
  };

  const badgeLabels = {
    synced: 'Tersinkron',
    pending: 'Menunggu',
    error: 'Gagal',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badgeColors[status]}`}
    >
      {badgeLabels[status]}
    </span>
  );
}
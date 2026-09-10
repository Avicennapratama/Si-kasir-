'use client';

import React from 'react';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';
import { OfflineProvider } from './OfflineProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <OfflineProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </OfflineProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
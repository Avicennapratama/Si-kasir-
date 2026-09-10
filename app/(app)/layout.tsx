"use client";

import React from "react";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full flex flex-col h-full min-h-screen">
      {/* Main content area - padding bottom for nav bar */}
      <main className="flex-1 pb-24 pt-safe">
        {children}
      </main>

      {/* Persistent Bottom Navigation - inside container now */}
      <BottomNav />
    </div>
  );
}
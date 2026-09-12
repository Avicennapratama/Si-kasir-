import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { AuthGuard } from "@/components/layout/auth-guard";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#090A0F",
};

export const metadata: Metadata = {
  title: "SiKasir AI",
  description: "Asisten Kasir Pintar UMKM & Ekraf Indonesia",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-bg text-foreground antialiased selection:bg-solar-500/30 selection:text-solar-100`}>
        <AuthProvider>
          <AuthGuard>
            {/* App shell: full-bleed di HP, full width di desktop */}
            <div className="w-full min-h-screen bg-[#090A0F] relative">
              {children}
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}

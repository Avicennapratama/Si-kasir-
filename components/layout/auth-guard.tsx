"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, business, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== "/login") {
        router.push("/login");
      } else if (user && !business && pathname !== "/onboarding") {
        router.push("/onboarding");
      } else if (user && business && (pathname === "/login" || pathname === "/onboarding" || pathname === "/")) {
        router.push("/dashboard");
      }
    }
  }, [user, business, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  // Prevent flash of protected content while redirecting
  if (!user && pathname !== "/login") return null;
  if (user && !business && pathname !== "/onboarding") return null;

  return <>{children}</>;
}

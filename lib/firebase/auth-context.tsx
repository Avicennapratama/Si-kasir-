"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./config";

interface BusinessProfile {
  id: string;
  name: string;
  category: string;
}

interface AuthContextType {
  user: User | null;
  business: BusinessProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<{ isNewUser: boolean }>;
  logout: () => Promise<void>;
  refreshBusiness: () => Promise<void>;
  updateBusinessProfile: (data: { name: string; category: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  business: null,
  loading: true,
  signInWithGoogle: async () => ({ isNewUser: false }),
  logout: async () => {},
  refreshBusiness: async () => {},
  updateBusinessProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBusiness = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists() && userDoc.data().businessId) {
        const bId = userDoc.data().businessId;
        const bDoc = await getDoc(doc(db, "businesses", bId));
        if (bDoc.exists()) {
          setBusiness({ id: bId, ...bDoc.data() } as BusinessProfile);
        }
      } else {
        setBusiness(null);
      }
    } catch (e) {
      console.error("Failed to load business profile", e);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;
        } catch (e) {
          console.warn("Could not get ID token for cookie", e);
        }
        await fetchBusiness(currentUser.uid);
      } else {
        document.cookie = `auth-token=; path=/; max-age=0; SameSite=Lax`;
        setBusiness(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<{ isNewUser: boolean }> => {
    try {
      const res = await signInWithPopup(auth, googleProvider);
      
      // Set cookie immediately before router.push to avoid middleware race condition
      const token = await res.user.getIdToken();
      document.cookie = `auth-token=${token}; path=/; max-age=86400; SameSite=Lax`;

      const userRef = doc(db, "users", res.user.uid);
      const snap = await getDoc(userRef);
      
      let isNewUser = false;
      if (!snap.exists()) {
        isNewUser = true;
        await setDoc(userRef, {
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
          createdAt: new Date(),
        });
      } else {
        // Jika ada user document tapi belum punya businessId, anggap user baru yang belum onboarding
        if (!snap.data().businessId) {
          isNewUser = true;
        }
      }
      
      return { isNewUser };
    } catch (error) {
      console.error("Google Auth error:", error);
      throw error;
    }
  };

  const logout = async () => {
    document.cookie = `auth-token=; path=/; max-age=0; SameSite=Lax`;
    await signOut(auth);
  };

  const refreshBusiness = async () => {
    if (user) {
      await fetchBusiness(user.uid);
    }
  };

  const updateBusinessProfile = async (data: { name: string; category: string }) => {
    if (!user) throw new Error("Pengguna belum masuk");
    const businessId = `biz_${user.uid}`;
    const bizRef = doc(db, "businesses", businessId);
    
    await setDoc(bizRef, {
      ...data,
      ownerId: user.uid,
      updatedAt: new Date(),
    }, { merge: true });

    // Hubungkan businessId ke profil user
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, { businessId }, { merge: true });

    setBusiness({
      id: businessId,
      name: data.name,
      category: data.category,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        loading,
        signInWithGoogle,
        logout,
        refreshBusiness,
        updateBusinessProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
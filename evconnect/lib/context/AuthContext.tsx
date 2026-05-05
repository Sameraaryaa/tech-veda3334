"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "firebase/auth";
import { onAuthChange, getUserProfile, signOutUser } from "@/lib/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string;
  photoURL: string | null;
  role: "owner" | "user" | "both";
}

interface AuthContextType {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  logout: async () => {},
});

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        try {
          const profile = await getUserProfile(fbUser.uid);
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: profile?.name || fbUser.displayName || "User",
            photoURL: profile?.photoURL || fbUser.photoURL,
            role: profile?.role || "user",
          });
        } catch {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "User",
            photoURL: fbUser.photoURL,
            role: "user",
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOutUser();
    setUser(null);
    setFirebaseUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

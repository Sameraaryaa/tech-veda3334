"use client";

import { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { onAuthChange, getUserProfile } from "@/lib/firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "owner" | "user" | "both";
}

interface UseAuthReturn {
  user: AuthUser | null;
  firebaseUser: User | null;
  loading: boolean;
  error: string | null;
}

/**
 * useAuth — listens to Firebase Auth state + fetches role from DB
 */
export function useAuth(): UseAuthReturn {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          // Fallback to Firebase user info
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

  return { user, firebaseUser, loading, error };
}

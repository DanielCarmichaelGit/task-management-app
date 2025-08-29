"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types/database";
import { getAuth, logout } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated via cookies
    const { user: authUser } = getAuth();
    setUser(authUser);
    setLoading(false);

    // Listen for unauthorized responses from API
    const handleUnauthorized = () => {
      setUser(null);
      // Don't redirect - just log out locally
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, []);

  const signOut = async () => {
    await logout();
    setUser(null);
    // Don't redirect - let the component handle navigation
  };

  const value = {
    user,
    loading,
    signOut,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

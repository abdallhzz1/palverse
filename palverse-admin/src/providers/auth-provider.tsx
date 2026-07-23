"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { AuthUser } from "@/types/api";
import { authService } from "@/services/auth.service";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: AuthUser) => void;
  logout: () => Promise<void>;
  hasRole: (user: AuthUser | null, role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const bootstrapped = useRef(false);

  const fetchUser = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("palverse_admin_token");
    }

    try {
      const currentUser = await authService.me();
      setUser(currentUser);
    } catch {
      // Keep prior user on transient failures after first successful load.
      setUser((prev) => (bootstrapped.current ? prev : null));
    } finally {
      bootstrapped.current = true;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  const login = (newUser: AuthUser) => {
    setUser(newUser);
    bootstrapped.current = true;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Cookie is cleared server-side when possible.
    } finally {
      setUser(null);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
  };

  const hasRole = (currentUser: AuthUser | null, role: string) => {
    if (!currentUser || !Array.isArray(currentUser.roles)) return false;
    return currentUser.roles.includes(role);
  };

  const isAuthenticated = !!user;
  const isAdmin = isAuthenticated && hasRole(user, "admin");

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

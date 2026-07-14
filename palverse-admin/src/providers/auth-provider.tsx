"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthUser } from "@/types/api";
import { authService } from "@/services/auth.service";
import { TOKEN_STORAGE_KEY } from "@/lib/constants";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  hasRole: (user: AuthUser | null, role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Start with true to prevent premature redirects on first load
  const [isLoading, setIsLoading] = useState(true);

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    try {
      const user = await authService.me();
      setUser(user);
    } catch (error) {
      clearSession();
    } finally {
      setIsLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchUser();
  }, [fetchUser]);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    try {
      void authService.logout();
    } catch (error) {
      console.error("Logout API failed, but session will be cleared anyway");
    } finally {
      clearSession();
    }
  };

  const hasRole = (user: AuthUser | null, role: string) => {
    if (!user || !Array.isArray(user.roles)) return false;
    return user.roles.includes(role);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = isAuthenticated && hasRole(user, "admin");

  const value: AuthContextType = {
    user,
    token,
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

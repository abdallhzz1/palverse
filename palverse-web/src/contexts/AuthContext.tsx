"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { PublicUser } from "@/types/auth";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: (credentials: Record<string, string>) => Promise<PublicUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const PublicAuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const data = await authService.me();
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("palverse_web_token");
    }
    await refreshUser();
    setIsInitializing(false);
  }, [refreshUser]);

  useEffect(() => {
    void initializeAuth();

    const handleUnauthorized = () => {
      setUser(null);
      router.push(
        "/login?redirect=" + encodeURIComponent(window.location.pathname)
      );
    };

    window.addEventListener("palverse:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("palverse:unauthorized", handleUnauthorized);
    };
  }, [initializeAuth, router]);

  const login = async (
    credentials: Record<string, string>
  ): Promise<PublicUser> => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error", err);
    } finally {
      setUser(null);
      router.push("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isInitializing,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const usePublicAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("usePublicAuth must be used within a PublicAuthProvider");
  }
  return context;
};

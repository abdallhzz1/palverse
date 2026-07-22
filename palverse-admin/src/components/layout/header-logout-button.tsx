"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";

export function HeaderLogoutButton() {
  const { logout } = useAuth();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 text-muted-foreground hover:text-red-600 dark:hover:text-red-400"
      onClick={logout}
      aria-label="تسجيل الخروج"
    >
      <LogOut className="h-4 w-4" />
      <span className="sr-only">تسجيل الخروج</span>
    </Button>
  );
}

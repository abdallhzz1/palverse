"use client";

import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  const { user } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">فتح القائمة</span>
        </Button>
        <h1 className="text-lg font-semibold">لوحة الإدارة</h1>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {user && (
          <div className="flex items-center gap-3 border-r border-border pr-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="text-xs text-muted-foreground mt-1">مدير النظام</span>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-primary font-semibold text-latin">
              {getInitials(user.name)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

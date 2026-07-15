"use client";

import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/providers/auth-provider";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminAvatar } from "./admin-avatar";

export function DashboardHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 shadow-sm sm:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
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
            <AdminAvatar name={user.name} />
          </div>
        )}
      </div>
    </header>
  );
}

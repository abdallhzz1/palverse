"use client";

import { ThemeToggle } from "./theme-toggle";
import { HeaderNotificationsButton } from "./header-notifications-button";
import { HeaderLogoutButton } from "./header-logout-button";
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

      <div className="flex items-center gap-1 sm:gap-2">
        <HeaderNotificationsButton />
        <ThemeToggle />
        <HeaderLogoutButton />

        {user && (
          <div className="mr-1 flex items-center gap-3 border-r border-border pr-3 sm:mr-2 sm:pr-4">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-sm font-medium leading-none">{user.name}</span>
              <span className="mt-1 text-xs text-muted-foreground">مدير النظام</span>
            </div>
            <AdminAvatar name={user.name} />
          </div>
        )}
      </div>
    </header>
  );
}

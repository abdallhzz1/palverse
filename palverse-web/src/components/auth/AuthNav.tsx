"use client";

import { usePublicAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  User,
  Bell,
  Heart,
  LayoutDashboard,
  Store,
  MapPinned,
  Shield,
  Briefcase,
} from "lucide-react";
import { useEffect, useState, type ComponentType } from "react";
import { authService } from "@/services/auth.service";
import { isMerchantRole, isRepresentativeRole } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

function PanelIconLink({
  href,
  label,
  icon: Icon,
  className,
}: {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-[#1E7D4E] text-white transition-colors hover:bg-[#0F3D2E]",
        "h-10 w-10 md:h-auto md:w-auto md:gap-2 md:rounded-full md:px-5 md:py-2.5 md:font-bold",
        className
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}

export function AuthNav() {
  const { user, isAuthenticated, isInitializing } = usePublicAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      authService
        .getUnreadNotificationCount()
        .then(setUnreadCount)
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (isInitializing) {
    return <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100 dark:bg-gray-800 md:w-24 md:rounded-lg" />;
  }

  if (isAuthenticated && user) {
    const isMerchant = isMerchantRole(user.roles);
    const isRep = isRepresentativeRole(user.roles);
    const isFollowUp = user.roles?.includes("follow_up");
    const isAdmin = user.roles?.includes("admin");
    const isExecutive = user.roles?.includes("executive_manager");

    const isStaff = isMerchant || isRep || isFollowUp || isAdmin || isExecutive;

    return (
      <div className="flex items-center gap-1.5 md:gap-4">
        {isMerchant && (
          <PanelIconLink href="/merchant" label="لوحة المحل" icon={Store} />
        )}
        {isRep && (
          <PanelIconLink href="/representative" label="لوحة المندوب" icon={MapPinned} />
        )}
        {isFollowUp && (
          <PanelIconLink href="/follow-up" label="لوحة المتابعة" icon={LayoutDashboard} />
        )}
        {isAdmin && (
          <PanelIconLink
            href="/admin"
            label="لوحة الإدارة"
            icon={Shield}
            className="bg-[#0F3D2E] hover:bg-[#1E7D4E]"
          />
        )}
        {isExecutive && (
          <PanelIconLink
            href="/executive"
            label="الإدارة التنفيذية"
            icon={Briefcase}
            className="bg-[#0F3D2E] hover:bg-[#1E7D4E]"
          />
        )}

        {!isStaff && (
          <>
            <Link
              href="/account/favorites"
              className="relative hidden rounded-full p-2 text-[#0F3D2E] transition-colors hover:bg-[#EAF3EC] dark:text-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 md:flex"
            >
              <Heart className="h-5 w-5" />
            </Link>
            <Link
              href="/account/notifications"
              className="relative hidden rounded-full p-2 text-[#0F3D2E] transition-colors hover:bg-[#EAF3EC] dark:text-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 md:flex"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-[#1F2522]" />
              )}
            </Link>
            <Link
              href="/account"
              className="flex items-center gap-2 rounded-full bg-[#0F3D2E] px-5 py-2.5 font-bold text-white transition-colors hover:bg-[#1E7D4E]"
            >
              <User className="h-4 w-4" />
              <span className="hidden md:inline">{user.name.split(" ")[0]}</span>
              <span className="md:hidden">حسابي</span>
            </Link>
          </>
        )}
      </div>
    );
  }

  return null;
}

"use client";

import { usePublicAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { User, LogIn, Bell, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { isMerchantRole, isRepresentativeRole } from "@/lib/auth/roles";

export function AuthNav() {
  const { user, isAuthenticated, isInitializing } = usePublicAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      authService.getUnreadNotificationCount()
        .then(setUnreadCount)
        .catch(() => {});
    }
  }, [isAuthenticated]);

  if (isInitializing) {
    return <div className="w-24 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />;
  }

  if (isAuthenticated && user) {
    const isMerchant = isMerchantRole(user.roles);
    const isRep = isRepresentativeRole(user.roles);
    const isFollowUp = user.roles?.includes("follow_up");
    const isAdmin = user.roles?.includes("admin");
    const isExecutive = user.roles?.includes("executive_manager");

    const isStaff = isMerchant || isRep || isFollowUp || isAdmin || isExecutive;

    return (
      <div className="flex items-center gap-2 md:gap-4">
        {isMerchant && (
          <Link
            href="/merchant"
            className="bg-[#1E7D4E] text-white px-5 py-2 rounded-xl font-bold hover:bg-[#0F3D2E] transition-colors"
          >
            لوحة المحل
          </Link>
        )}
        {isRep && (
          <Link
            href="/representative"
            className="flex items-center gap-2 bg-[#1E7D4E] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#0F3D2E] transition-colors"
          >
            لوحة المندوب
          </Link>
        )}
        {isFollowUp && (
          <Link
            href="/follow-up"
            className="flex items-center gap-2 bg-[#1E7D4E] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#0F3D2E] transition-colors"
          >
            لوحة المتابعة
          </Link>
        )}
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-2 bg-[#0F3D2E] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#1E7D4E] transition-colors"
          >
            لوحة الإدارة
          </Link>
        )}
        {isExecutive && (
          <Link
            href="/executive"
            className="flex items-center gap-2 bg-[#0F3D2E] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#1E7D4E] transition-colors"
          >
            الإدارة التنفيذية
          </Link>
        )}

        {!isStaff && (
          <>
            <Link 
              href="/account/favorites" 
              className="relative p-2 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 rounded-full transition-colors hidden md:flex"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <Link 
              href="/account/notifications" 
              className="relative p-2 text-[#0F3D2E] dark:text-[#EAF3EC] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 rounded-full transition-colors hidden md:flex"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-[#1F2522]" />
              )}
            </Link>
            <Link 
              href="/account" 
              className="flex items-center gap-2 bg-[#0F3D2E] text-white px-5 py-2.5 rounded-full font-bold hover:bg-[#1E7D4E] transition-colors"
            >
              <User className="w-4 h-4" />
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

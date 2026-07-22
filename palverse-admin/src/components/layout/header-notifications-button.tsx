"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { notificationsService } from "@/services/notifications.service";
import { cn } from "@/lib/utils";

export function HeaderNotificationsButton() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const isActive = pathname === "/notifications" || pathname.startsWith("/notifications/");

  useEffect(() => {
    let isMounted = true;

    const fetchUnreadCount = async () => {
      try {
        const response = await notificationsService.unreadCount();
        if (isMounted) {
          setUnreadCount(response.data.unread_count);
        }
      } catch {
        if (isMounted) {
          setUnreadCount(0);
        }
      }
    };

    void fetchUnreadCount();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("relative h-9 w-9", isActive && "bg-muted")}
      asChild
    >
      <Link href="/notifications" aria-label="الإشعارات">
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="sr-only">الإشعارات</span>
      </Link>
    </Button>
  );
}

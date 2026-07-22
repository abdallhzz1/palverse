"use client";

import { isSafeInternalPath } from "@/lib/security/urls";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { NotificationMeta } from "@/types/auth";
import { Loader2, Bell, CheckCircle2, ChevronRight, Check } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await authService.getNotifications();
      setNotifications(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    setMarkingRead(id);
    try {
      await authService.markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read", err);
    } finally {
      setMarkingRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await authService.markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
    } catch (err) {
      console.error("Failed to mark all as read", err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const getNotificationLink = (notification: NotificationMeta) => {
    const { action_url, entity_type, entity_id } = notification.data;
    if (action_url && isSafeInternalPath(action_url)) return action_url;
    if (entity_type === "store" && entity_id) return `/stores/${entity_id}`;
    return null;
  };

  const hasUnread = notifications.some((n) => !n.read_at);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">الإشعارات</h1>
          <p className="text-gray-500 dark:text-gray-400">
            أحدث التنبيهات والتحديثات الخاصة بحسابك.
          </p>
        </div>
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="px-4 py-2.5 bg-[#EAF3EC] text-[#1E7D4E] hover:bg-[#EAF3EC]/80 dark:bg-[#0F3D2E]/50 dark:hover:bg-[#0F3D2E]/80 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isMarkingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            تحديد الكل كمقروء
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E7D4E]" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-[#1F2522] rounded-2xl">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">لا توجد إشعارات حالياً.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const isUnread = !notification.read_at;
            const link = getNotificationLink(notification);
            
            return (
              <div 
                key={notification.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  isUnread 
                    ? "bg-white dark:bg-[#171717] border-[#1E7D4E]/30 shadow-sm" 
                    : "bg-gray-50 dark:bg-[#1F2522] border-gray-100 dark:border-gray-800 opacity-70"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {isUnread && <div className="w-2 h-2 rounded-full bg-[#1E7D4E] shrink-0" aria-label="غير مقروء" />}
                      <h3 className={`font-bold ${isUnread ? "text-[#0F3D2E] dark:text-[#EAF3EC]" : "text-gray-600 dark:text-gray-400"}`}>
                        {notification.data.title}
                      </h3>
                    </div>
                    <p className={`text-sm mb-2 ${isUnread ? "text-gray-600 dark:text-gray-300" : "text-gray-500 dark:text-gray-500"}`}>
                      {notification.data.body}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(notification.created_at).toLocaleString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    
                    {link && (
                      <Link href={link} className="inline-flex items-center gap-1 mt-3 text-sm font-bold text-[#1E7D4E] hover:text-[#0F3D2E] transition-colors">
                        عرض التفاصيل
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  {isUnread && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markingRead === notification.id}
                      className="p-2 text-gray-400 hover:text-[#1E7D4E] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/50 rounded-xl transition-colors shrink-0"
                      title="تحديد كمقروء"
                    >
                      {markingRead === notification.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

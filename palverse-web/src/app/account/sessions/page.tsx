"use client";

import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { AuthSession } from "@/types/auth";
import { Loader2, Monitor, Smartphone, Trash2, ShieldCheck } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<AuthSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isRevokingAll, setIsRevokingAll] = useState(false);

  const fetchSessions = async () => {
    try {
      const data = await authService.getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRevoke = async (publicId: string) => {
    setRevokingId(publicId);
    try {
      await authService.revokeSession(publicId);
      setSessions((prev) => prev.filter((s) => s.public_id !== publicId));
    } catch (err) {
      console.error("Failed to revoke session", err);
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeOthers = async () => {
    setIsRevokingAll(true);
    try {
      await authService.revokeOtherSessions();
      setSessions((prev) => prev.filter((s) => s.is_current));
    } catch (err) {
      console.error("Failed to revoke other sessions", err);
    } finally {
      setIsRevokingAll(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2">الجلسات النشطة</h1>
          <p className="text-gray-500 dark:text-gray-400">
            الأجهزة والمتصفحات التي سجلت الدخول منها لحسابك.
          </p>
        </div>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeOthers}
            disabled={isRevokingAll}
            className="px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {isRevokingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            تسجيل الخروج من باقي الأجهزة
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1E7D4E]" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-[#1F2522] rounded-2xl">
          <ShieldCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 font-bold">لا توجد جلسات نشطة لعرضها.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            const isMobile = session.device_type?.toLowerCase().includes("mobile") || session.device_name?.toLowerCase().includes("android") || session.device_name?.toLowerCase().includes("ios");
            
            return (
              <div 
                key={session.public_id} 
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  session.is_current 
                    ? "bg-[#EAF3EC]/50 border-[#1E7D4E]/20 dark:bg-[#0F3D2E]/20 dark:border-[#1E7D4E]/30" 
                    : "bg-white dark:bg-[#1F2522] border-gray-100 dark:border-gray-800"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${session.is_current ? "bg-[#1E7D4E] text-white" : "bg-gray-100 dark:bg-[#171717] text-gray-500 dark:text-gray-400"}`}>
                    {isMobile ? <Smartphone className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{session.device_name}</p>
                      {session.is_current && (
                        <span className="px-2 py-0.5 bg-[#1E7D4E] text-white text-[10px] font-bold rounded-md">
                          الجهاز الحالي
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1" dir="ltr">
                      {session.ip_address}
                    </p>
                    <p className="text-xs text-gray-400">
                      آخر نشاط: {new Date(session.last_used_at).toLocaleString("ar-SA")}
                    </p>
                  </div>
                </div>

                {!session.is_current && (
                  <button
                    onClick={() => handleRevoke(session.public_id)}
                    disabled={revokingId === session.public_id}
                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-950/30 rounded-xl text-sm font-bold transition-colors shrink-0"
                  >
                    {revokingId === session.public_id ? <Loader2 className="w-4 h-4 animate-spin" /> : "إنهاء الجلسة"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Store, MapPin, Banknote, CreditCard, ArrowLeft, Target, TrendingUp, Calendar } from "lucide-react";
import Link from "next/link";
import { RepresentativeService } from "@/services/representative.service";
import type { RepresentativeDashboardSummary, RepresentativeDashboardActivity } from "@/types/representative";
import { usePublicAuth } from "@/contexts/AuthContext";

export default function RepresentativeDashboardPage() {
  const { user } = usePublicAuth();
  const [summary, setSummary] = useState<RepresentativeDashboardSummary | null>(null);
  const [activity, setActivity] = useState<RepresentativeDashboardActivity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await RepresentativeService.getDashboard();
        setSummary(res.data.summary);
        setActivity(res.data.activity);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "يا بطل";

  return (
    <div className="space-y-8 pb-10">
      
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#0F3D2E] to-[#1A3326] rounded-[2rem] p-8 md:p-12 text-white shadow-xl border border-white/5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-full h-full opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: "url('/brand/patterns/islamic-geometric-pattern.png')", backgroundSize: '120px' }} />
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#1E7D4E]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              أهلاً بك، {firstName} 🌟
            </h1>
            <p className="text-[#A8C5B0] text-base md:text-lg font-medium max-w-xl leading-relaxed">
              هذه لوحة تحكمك السريعة لمتابعة المحلات التي سجلتها، وعمولاتك المستحقة، وتحصيلاتك النقدية في مناطقك المخصصة.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <Link
                href="/representative/store-requests/new"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1E7D4E] text-white rounded-xl font-bold hover:bg-[#259b61] transition-all hover:-translate-y-0.5 shadow-lg shadow-[#1E7D4E]/30"
              >
                <Store className="w-5 h-5" />
                تسجيل متجر جديد
              </Link>
            </div>
          </div>
          
          <div className="shrink-0 hidden md:flex gap-4">
            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10 flex flex-col items-center justify-center min-w-[120px]">
              <Target className="w-8 h-8 text-[#A8C5B0] mb-2" />
              <p className="text-white font-bold text-xl">{summary?.requests.total || 0}</p>
              <p className="text-white/60 text-xs font-medium mt-1">المتاجر المستهدفة</p>
            </div>
            <div className="bg-[#1E7D4E]/20 p-5 rounded-2xl backdrop-blur-md border border-[#1E7D4E]/30 flex flex-col items-center justify-center min-w-[120px]">
              <TrendingUp className="w-8 h-8 text-[#4ade80] mb-2" />
              <p className="text-white font-bold text-xl">{summary?.commissions.pending_total || 0} ₪</p>
              <p className="text-[#4ade80]/80 text-xs font-medium mt-1">العمولات المستحقة</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Key Metrics Grid ── */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-6">
          <Link href="/representative/zones" className="bg-white dark:bg-[#1a2520] p-6 rounded-2xl border border-blue-100 dark:border-blue-900/30 hover:border-blue-300 transition-colors shadow-sm group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex items-start justify-between w-full mb-4">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-[#0F3D2E] dark:text-[#EAF3EC]">
                {summary.zones.assigned_count}
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between w-full">
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">مناطقي المخصصة</p>
              <ArrowLeft className="w-4 h-4 text-blue-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>
          
          <Link href="/representative/store-requests" className="bg-white dark:bg-[#1a2520] p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-300 transition-colors shadow-sm group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex items-start justify-between w-full mb-4">
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-[#0F3D2E] dark:text-[#EAF3EC]">
                {summary.requests.total}
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between w-full">
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">إجمالي طلبات المتاجر</p>
              <ArrowLeft className="w-4 h-4 text-indigo-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>

          <Link href="/representative/commissions" className="bg-white dark:bg-[#1a2520] p-6 rounded-2xl border border-green-100 dark:border-green-900/30 hover:border-green-300 transition-colors shadow-sm group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex items-start justify-between w-full mb-4">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center shrink-0">
                <Banknote className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-[#0F3D2E] dark:text-[#EAF3EC] flex items-baseline gap-1">
                {summary.commissions.pending_total} <span className="text-sm text-green-600">₪</span>
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between w-full">
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">العمولات المستحقة</p>
              <ArrowLeft className="w-4 h-4 text-green-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>

          <Link href="/representative/receipts" className="bg-white dark:bg-[#1a2520] p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30 hover:border-rose-300 transition-colors shadow-sm group relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-500" />
            <div className="relative z-10 flex items-start justify-between w-full mb-4">
              <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl flex items-center justify-center shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black text-[#0F3D2E] dark:text-[#EAF3EC] flex items-baseline gap-1">
                {summary.receipts.outstanding} <span className="text-sm text-rose-600">₪</span>
              </div>
            </div>
            <div className="relative z-10 flex items-center justify-between w-full">
              <p className="text-sm font-bold text-gray-600 dark:text-gray-400">التحصيلات النقدية المعلقة</p>
              <ArrowLeft className="w-4 h-4 text-rose-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>
        </div>
      )}

      {/* ── Lists Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent Requests */}
        <div className="bg-white dark:bg-[#171717] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#1a1a1a]/50 rounded-t-3xl">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] flex items-center gap-2">
              <Store className="w-5 h-5 text-[#1E7D4E]" />
              آخر الطلبات
            </h2>
            <Link href="/representative/store-requests" className="text-sm font-bold text-[#1E7D4E] hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="p-2 flex-1">
            {activity?.recent_requests && activity.recent_requests.length > 0 ? (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {activity.recent_requests.map((req) => (
                  <Link href={`/representative/store-requests/${req.public_id}`} key={req.public_id} className="p-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-xl transition-colors group">
                    <div className="p-3 bg-[#EAF3EC] dark:bg-[#0F3D2E]/40 rounded-xl shrink-0 group-hover:bg-[#1E7D4E] group-hover:text-white transition-colors text-[#1E7D4E] dark:text-[#EAF3EC]">
                      <Store className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] truncate">{req.store_name_ar}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-xs text-gray-500">{new Date(req.created_at).toLocaleDateString('ar-SA')}</span>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        req.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                        req.status === 'draft' ? 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700' :
                        'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                      }`}>
                        {req.status_label_ar}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                  <Store className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد طلبات مسجلة بعد.</p>
                <p className="text-sm text-gray-400 mt-1">ابدأ بتسجيل أول متجر الآن!</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Commissions */}
        <div className="bg-white dark:bg-[#171717] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col">
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#1a1a1a]/50 rounded-t-3xl">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] flex items-center gap-2">
              <Banknote className="w-5 h-5 text-green-600" />
              العمولات الأخيرة
            </h2>
            <Link href="/representative/commissions" className="text-sm font-bold text-green-600 hover:underline flex items-center gap-1">
              عرض الكل <ArrowLeft className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="p-2 flex-1">
            {activity?.recent_commissions && activity.recent_commissions.length > 0 ? (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {activity.recent_commissions.map((comm) => (
                  <div key={comm.public_id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-[#1a1a1a] rounded-xl transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-xl shrink-0 text-green-600 dark:text-green-400">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">عمولة تسجيل</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-500">{new Date(comm.earned_at).toLocaleDateString('ar-SA')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-black text-lg text-[#0F3D2E] dark:text-[#EAF3EC]">{comm.amount} <span className="text-sm text-gray-500">{comm.currency}</span></p>
                      <span className={`inline-block mt-1 text-xs font-bold ${comm.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                        {comm.status === 'paid' ? 'تم الدفع' : 'مستحقة'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                  <Banknote className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">لا توجد عمولات مسجلة بعد.</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

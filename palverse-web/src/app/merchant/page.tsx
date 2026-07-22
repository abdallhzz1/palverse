"use client";

import { useEffect, useState } from "react";
import { Store, Tag, Clock, CheckCircle, AlertTriangle, ArrowLeft, Plus, Activity, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { merchantService } from "@/services/merchant.service";
import type { MerchantDashboardSummary, RecentActivity } from "@/types/merchant";
import { usePublicAuth } from "@/contexts/AuthContext";

export default function MerchantDashboardPage() {
  const { user } = usePublicAuth();
  const [summary, setSummary] = useState<MerchantDashboardSummary | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [firstStoreId, setFirstStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [summaryRes, storesRes, act] = await Promise.all([
          merchantService.getSummary(),
          merchantService.getStores(),
          merchantService.getRecentActivity ? merchantService.getRecentActivity(5) : Promise.resolve([])
        ]);
        
        setSummary(summaryRes);
        setActivities(act || []);
        
        const storesData = storesRes.data || storesRes;
        if (storesData && storesData.length > 0) {
          setFirstStoreId(storesData[0].public_id);
        } else {
          router.replace("/merchant/onboarding");
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || "صاحب المحل";

  const activeOffers = summary?.offers?.active_offers ?? 0;
  const pendingStores = summary?.stores?.pending_stores ?? 0;
  const rejectedStores = summary?.stores?.rejected_stores ?? 0;

  return (
    <div className="space-y-6 md:space-y-8 pb-10">
      
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#0F3D2E] to-[#155A38] rounded-[2rem] p-6 md:p-10 text-white shadow-lg">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" 
             style={{ backgroundImage: "url('/brand/patterns/islamic-geometric-pattern.png')", backgroundSize: '150px' }} />
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2 tracking-tight">
              أهلاً بك يا {firstName} 👋
            </h1>
            <p className="text-[#A8C5B0] text-sm md:text-base font-medium max-w-md leading-relaxed">
              هنا يمكنك إدارة محلك، متابعة أداء العروض، ومعرفة آخر التحديثات الخاصة بنشاطك التجاري.
            </p>
          </div>
          <div className="shrink-0">
            {firstStoreId ? (
              <Link
                href={`/merchant/stores/${firstStoreId}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#0F3D2E] rounded-xl font-bold hover:bg-[#EAF3EC] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
              >
                <Store className="w-5 h-5" />
                إدارة بيانات المحل
              </Link>
            ) : (
              <Link
                href="/merchant/onboarding"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#1E7D4E] text-white rounded-xl font-bold hover:bg-[#165e3b] transition-all shadow-[0_4px_14px_rgba(0,0,0,0.1)] hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
              >
                <Plus className="w-5 h-5" />
                إعداد المحل
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Statistics Cards ── */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5">
          {/* Card 1: Active Offers */}
          <div className="bg-white dark:bg-[#1a2520] p-5 md:p-6 rounded-[1.5rem] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">العروض النشطة</p>
                <p className="text-2xl md:text-3xl font-black text-[#0F3D2E] dark:text-[#EAF3EC]">{activeOffers}</p>
              </div>
              <div className="p-2.5 md:p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                <Tag className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          {/* Card 2: Pending items */}
          <div className="bg-white dark:bg-[#1a2520] p-5 md:p-6 rounded-[1.5rem] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-colors" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">قيد المراجعة</p>
                <p className="text-2xl md:text-3xl font-black text-yellow-600 dark:text-yellow-500">{pendingStores}</p>
              </div>
              <div className="p-2.5 md:p-3 bg-yellow-50 dark:bg-yellow-500/10 rounded-xl text-yellow-600 dark:text-yellow-500">
                <Clock className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>

          {/* Card 3: Rejected */}
          <div className="bg-white dark:bg-[#1a2520] p-5 md:p-6 rounded-[1.5rem] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-colors" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">مرفوضة / للتعديل</p>
                <p className="text-2xl md:text-3xl font-black text-red-600 dark:text-red-500">{rejectedStores}</p>
              </div>
              <div className="p-2.5 md:p-3 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-600 dark:text-red-500">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#0F3D2E] dark:text-[#EAF3EC]">
              <Activity className="w-5 h-5" />
              <h2 className="text-xl font-extrabold tracking-tight">آخر النشاطات</h2>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#1a2520] rounded-[2rem] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 shadow-sm overflow-hidden p-2">
            {activities && activities.length > 0 ? (
              <div className="flex flex-col">
                {activities.map((activity, index) => (
                  <div key={activity.id} className={`p-4 md:p-5 flex items-start gap-4 hover:bg-gray-50/50 dark:hover:bg-[#1F2522] rounded-2xl transition-colors ${index !== activities.length - 1 ? 'border-b border-dashed border-[#EAF3EC] dark:border-[#0F3D2E]/30 pb-5 mb-1' : ''}`}>
                    <div className="mt-0.5 p-2.5 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 rounded-xl text-[#1E7D4E] dark:text-[#4ade80] shrink-0">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{activity.action}</p>
                        <span className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-md w-fit">
                          {new Date(activity.created_at).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed">{activity.description_ar}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 flex flex-col items-center text-center text-gray-500">
                <div className="w-16 h-16 bg-gray-50 dark:bg-[#1F2522] rounded-full flex items-center justify-center mb-4">
                  <Activity className="w-8 h-8 text-gray-400" />
                </div>
                <p className="font-bold text-gray-600 dark:text-gray-300">لا توجد نشاطات مسجلة بعد.</p>
                <p className="text-sm mt-1">سيظهر سجل بجميع حركاتك ومحلك هنا.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar / Helper Cards */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-[#1a2520] rounded-[2rem] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 shadow-sm overflow-hidden p-6 relative group">
            <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-[#EAF3EC]/50 dark:bg-[#0F3D2E]/30 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-[#F9FBF9] dark:bg-[#1F2522] border border-[#EAF3EC] dark:border-[#0F3D2E] rounded-xl flex items-center justify-center mb-4 text-[#1E7D4E] dark:text-[#4ade80]">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2 tracking-tight">إدارة نشاطك بفعالية</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                تأكد من استكمال جميع بيانات محلك مثل إضافة صور جذابة، تحديث ساعات العمل، وكتابة وصف دقيق لجذب المزيد من الزبائن.
              </p>
              {firstStoreId && (
                <Link
                  href={`/merchant/stores/${firstStoreId}`}
                  className="inline-flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-[#1F2522] hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/40 text-[#1E7D4E] dark:text-[#4ade80] rounded-xl font-bold transition-colors text-sm"
                >
                  <span>الانتقال للمحل</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a2520] rounded-[2rem] border border-[#EAF3EC] dark:border-[#0F3D2E]/40 shadow-sm overflow-hidden p-6 relative group">
            <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <Tag className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#0F3D2E] dark:text-[#EAF3EC] mb-2 tracking-tight">العروض تزيد مبيعاتك</h3>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                هل تعلم أن المحلات التي تضيف عروضاً مستمرة تحصل على زيارات أكثر بنسبة 40٪؟ ابدأ بإضافة عروضك الآن.
              </p>
              {firstStoreId && (
                <Link
                  href={`/merchant/stores/${firstStoreId}/offers`}
                  className="inline-flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-[#1F2522] hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl font-bold transition-colors text-sm"
                >
                  <span>إدارة العروض</span>
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

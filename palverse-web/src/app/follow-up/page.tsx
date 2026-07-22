"use client";

import { useEffect, useState } from "react";
import { followUpService } from "@/services/followUp.service";
import { 
  Store, 
  RefreshCcw, 
  CreditCard,
  Users,
  AlertTriangle,
  FileText,
  Activity,
  ArrowLeft,
  Briefcase
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { usePublicAuth } from "@/contexts/AuthContext";

export default function FollowUpDashboard() {
  const { user } = usePublicAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await followUpService.getDashboardSummary();
        setData(response);
      } catch (error) {
        toast.error("حدث خطأ أثناء تحميل بيانات لوحة التحكم");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) return null;

  const firstName = user?.name?.split(" ")[0] || "فريق المتابعة";

  const statCards = [
    {
      title: "طلبات المتاجر قيد المراجعة",
      value: data.requests.under_review,
      icon: Store,
      href: "/follow-up/store-requests?status=under_review",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800"
    },
    {
      title: "متاجر تحتاج تعديلات",
      value: data.requests.needs_changes,
      icon: FileText,
      href: "/follow-up/store-requests?status=needs_changes",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      border: "border-orange-100 dark:border-orange-800"
    },
    {
      title: "طلبات الانضمام الجديدة",
      value: data.join_requests.pending,
      icon: Briefcase,
      href: "/follow-up/join-requests",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800"
    },
    {
      title: "تجديدات قريبة (7 أيام)",
      value: data.subscriptions.renewals_due_7_days,
      icon: RefreshCcw,
      href: "/follow-up/renewals?status_filter=expiring_soon",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-100 dark:border-purple-800"
    },
    {
      title: "اشتراكات منتهية",
      value: data.subscriptions.expired,
      icon: AlertTriangle,
      href: "/follow-up/renewals?status_filter=expired",
      color: "text-red-600 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
      border: "border-red-100 dark:border-red-800"
    },
    {
      title: "اشتراكات غير مسددة",
      value: data.subscriptions.unpaid,
      icon: CreditCard,
      href: "/follow-up/unpaid",
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-100 dark:border-rose-800"
    },
    {
      title: "المندوبون النشطون",
      value: data.representatives.total,
      icon: Users,
      href: "/follow-up/representatives",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-900/20",
      border: "border-indigo-100 dark:border-indigo-800"
    }
  ];

  return (
    <div className="space-y-8 pb-10">
      
      {/* ── Welcome Banner ── */}
      <div className="relative overflow-hidden bg-gradient-to-l from-[#0F3D2E] to-[#155A38] rounded-[2rem] p-8 md:p-12 text-white shadow-lg">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none" 
             style={{ backgroundImage: "url('/brand/patterns/islamic-geometric-pattern.png')", backgroundSize: '150px' }} />
        <div className="absolute -left-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-10 w-40 h-40 bg-[#1E7D4E]/30 rounded-full blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
              أهلاً بك يا {firstName} 👋
            </h1>
            <p className="text-[#A8C5B0] text-base md:text-lg font-medium max-w-xl leading-relaxed">
              من خلال لوحة المتابعة، يمكنك الاطلاع على ملخص طلبات المحلات، ومتابعة الانضمام والتجديدات الخاصة بالمشتركين لضمان سير العمل بكفاءة.
            </p>
          </div>
          <div className="shrink-0 hidden lg:block bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">حالة النظام</p>
                <p className="text-white font-bold text-lg">مستقر وجاهز</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Action Required Stats ── */}
      <div>
        <h2 className="text-xl font-extrabold text-[#0F3D2E] dark:text-[#EAF3EC] mb-5 flex items-center gap-2">
          <Activity className="w-6 h-6 text-[#1E7D4E]" />
          إحصائيات تتطلب المتابعة
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link 
                key={index}
                href={stat.href}
                className={`bg-white dark:bg-[#1a2520] rounded-2xl p-6 border ${stat.border} dark:border-[#0F3D2E]/40 shadow-sm hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between min-h-[140px]`}
              >
                <div className={`absolute -right-4 -bottom-4 w-24 h-24 ${stat.bg} rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-500`} />
                
                <div className="relative z-10 flex items-start justify-between w-full mb-4">
                  <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="text-3xl font-black text-[#0F3D2E] dark:text-[#EAF3EC]">
                    {stat.value}
                  </div>
                </div>
                
                <div className="relative z-10 flex items-center justify-between w-full">
                  <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </p>
                  <ArrowLeft className={`w-4 h-4 ${stat.color} opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all`} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

    </div>
  );
}

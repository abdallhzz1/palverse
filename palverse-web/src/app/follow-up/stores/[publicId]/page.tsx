"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Store,
  Phone,
  Mail,
  Globe,
  MapPin,
  Building2,
  ExternalLink,
  Edit3,
  Image as ImageIcon,
  Clock,
  Link as LinkIcon,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { followUpStoresService } from "@/services/followUpStores.service";
import type { FollowUpStore } from "@/types/followUpStore";

export default function FollowUpStoreOverviewPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const [store, setStore] = useState<FollowUpStore | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    followUpStoresService.getStore(resolvedParams.publicId)
      .then((res) => setStore(res))
      .catch((err) => {
        console.error(err);
        setError(err?.message || "حدث خطأ أثناء جلب بيانات المحل.");
      })
      .finally(() => setIsLoading(false));
  }, [resolvedParams.publicId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !store) {
    return <div className="p-8 text-center text-red-500 font-bold">{error || "المحل غير موجود."}</div>;
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "معتمد", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300", icon: CheckCircle };
      case "pending":
        return { label: "قيد المراجعة", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300", icon: AlertCircle };
      case "rejected":
        return { label: "مرفوض", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300", icon: XCircle };
      default:
        return { label: status, color: "bg-gray-100 text-gray-800", icon: AlertCircle };
    }
  };

  const statusInfo = getStatusInfo(store.status);
  const StatusIcon = statusInfo.icon;

  const quickLinks = [
    { name: "تحديث البيانات", href: `/follow-up/stores/${store.public_id}/edit`, icon: Edit3, desc: "تعديل المعلومات الأساسية ومعلومات التواصل" },
    { name: "الصور والشعار", href: `/follow-up/stores/${store.public_id}/media`, icon: ImageIcon, desc: "إدارة الشعار، الغلاف ومعرض الصور" },
    { name: "ساعات العمل", href: `/follow-up/stores/${store.public_id}/hours`, icon: Clock, desc: "تحديد أوقات الدوام لكل يوم" },
    { name: "روابط التواصل", href: `/follow-up/stores/${store.public_id}/social-links`, icon: LinkIcon, desc: "روابط حسابات التواصل الاجتماعي" },
    { name: "العروض", href: `/follow-up/stores/${store.public_id}/offers`, icon: Tag, desc: "إدارة العروض والتخفيضات الخاصة" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <Link
            href="/follow-up/stores"
            className="p-2 bg-white dark:bg-[#1A1A1A] rounded-full shadow-sm hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors"
          >
            <ArrowRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{store.name_ar}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />
                {statusInfo.label}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                store.is_active ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
              }`}>
                {store.is_active ? "نشط" : "غير نشط"}
              </span>
            </div>
          </div>
        </div>

        {store.web_url && store.is_publicly_visible && (
          <a
            href={store.web_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[#1E7D4E] font-bold hover:underline"
          >
            عرض المحل للعامة
            <ExternalLink className="w-4 h-4" />
          </a>
        )}
      </div>

      {store.status === "rejected" && store.rejection_reason && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-bold">سبب الرفض</h3>
              <p className="text-red-700 mt-1">{store.rejection_reason}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#1E7D4E]" />
              بيانات المحل
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">اسم المحل (بالعربية)</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{store.name_ar}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">اسم المحل (بالإنجليزية)</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{store.name_en || "غير محدد"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">الوصف (بالعربية)</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1 whitespace-pre-line">{store.description_ar || "غير محدد"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">التصنيف</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{store.category?.name_ar || "غير محدد"}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#1E7D4E]" />
              معلومات التواصل والعنوان
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1" dir="ltr">{store.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">رقم الواتساب</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1" dir="ltr">{store.whatsapp || "غير محدد"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> البريد الإلكتروني</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{store.email || "غير محدد"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"><Globe className="w-3.5 h-3.5" /> الموقع الإلكتروني</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{store.website || "غير محدد"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">المدينة</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{store.city?.name_ar || "غير محدد"}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500 dark:text-gray-400">المنطقة</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1">{store.zone?.name_ar || "غير محدد"}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-gray-500 dark:text-gray-400">العنوان التفصيلي</label>
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {store.address_ar}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 border border-[#EAF3EC] dark:border-[#1F2522]">
            <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">إدارة سريعة</h2>
            <div className="space-y-1">
              {quickLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/40 transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 flex items-center justify-center shrink-0 group-hover:bg-[#1E7D4E] transition-colors">
                      <Icon className="w-4 h-4 text-[#1E7D4E] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] text-sm">{link.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{link.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {store.owner && (
            <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-[#EAF3EC] dark:border-[#1F2522]">
              <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#1E7D4E]" />
                صاحب المحل
              </h2>
              <div className="space-y-2">
                <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC]">{store.owner.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{store.owner.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

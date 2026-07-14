"use client";

import { useStoreDetails } from "@/hooks/use-store-details";
import { useStoreLinks } from "@/hooks/use-store-links";
import { StoreStatusBadge } from "@/components/stores/store-status-badge";
import { StoreVisibilityBadge } from "@/components/stores/store-visibility-badge";
import { StoreMediaGallery } from "@/components/stores/store-media-gallery";
import { StoreWorkingHours } from "@/components/stores/store-working-hours";
import { StoreActions } from "@/components/stores/store-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Link as LinkIcon, QrCode, Globe, Download, Copy, AlertCircle, ArrowRight, Clock, Info, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { use } from "react";
import { formatCurrency } from "@/lib/utils/formatters";

export default function StoreDetailsPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const { store, subscriptions, isLoading, error, refresh } = useStoreDetails(resolvedParams.publicId);
  const { links, qrObjectUrl, isLoadingLinks, isLoadingQr, fetchLinks, fetchQr, downloadQr, copyToClipboard } = useStoreLinks(resolvedParams.publicId, store?.slug);

  useEffect(() => {
    if (store?.slug && store.status === "approved" && store.is_active) {
      fetchLinks();
      fetchQr();
    }
  }, [store?.slug, store?.status, store?.is_active, fetchLinks, fetchQr]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 flex flex-col md:flex-row gap-6">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
          <div className="flex-1 space-y-4">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="flex gap-2">
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
            </div>
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded max-w-md"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="space-y-6">
        <Link href="/stores" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة إلى المحلات
        </Link>
        <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-6 rounded-lg border border-red-200 dark:border-red-800 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 mb-4" />
          <h3 className="text-lg font-bold mb-2">لم يتم العثور على المحل</h3>
          <p className="text-sm">المحل الذي تبحث عنه غير موجود أو حدث خطأ أثناء جلب البيانات.</p>
          <Button variant="outline" className="mt-4" onClick={refresh}>إعادة المحاولة</Button>
        </div>
      </div>
    );
  }

  const activeSubscription = subscriptions?.data.find(s => s.status === "active" && s.is_currently_valid);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/stores" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة إلى المحلات
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0 flex items-center justify-center">
            {store.logo ? (
              <img src={store.logo.url} alt={store.name_ar} className="w-full h-full object-contain p-2" />
            ) : (
              <span className="text-4xl font-bold text-slate-300 dark:text-slate-600">
                {store.name_ar.charAt(0)}
              </span>
            )}
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {store.name_ar}
                </h2>
                <StoreStatusBadge status={store.status} />
                <StoreVisibilityBadge store={store} activeSubscription={activeSubscription} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
                {store.slug && (
                  <span className="flex items-center gap-1.5" dir="ltr">
                    <Globe className="w-4 h-4" />
                    {store.slug}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {store.city?.name_ar} {store.zone ? `، ${store.zone.name_ar}` : ''}
                </span>
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4" />
                  {store.category?.name_ar}
                </span>
                <span className="flex items-center gap-1.5" dir="ltr">
                  #{store.public_id.substring(0, 8)}
                </span>
              </div>
            </div>

            <StoreActions store={store} onSuccess={refresh} />
          </div>
        </div>

        {/* Rejection Alert */}
        {store.status === "rejected" && store.rejection_reason && (
          <div className="px-6 py-4 bg-red-50 dark:bg-red-900/10 border-t border-red-100 dark:border-red-900/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">سبب الرفض</h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{store.rejection_reason}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Information) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">المعلومات الأساسية</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6 text-sm">
                <div className="md:col-span-2">
                  <dt className="text-slate-500 dark:text-slate-400 mb-1">الوصف (عربي)</dt>
                  <dd className="text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
                    {store.description_ar || <span className="text-slate-400">لا يوجد وصف</span>}
                  </dd>
                </div>
                {store.description_en && (
                  <div className="md:col-span-2">
                    <dt className="text-slate-500 dark:text-slate-400 mb-1">الوصف (إنجليزي)</dt>
                    <dd className="text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap" dir="ltr">
                      {store.description_en}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-slate-500 dark:text-slate-400 mb-1">رقم الهاتف</dt>
                  <dd className="text-slate-900 dark:text-white flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span dir="ltr">{store.phone || <span className="text-slate-400 text-xs">غير متوفر</span>}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500 dark:text-slate-400 mb-1">رقم الواتساب</dt>
                  <dd className="text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="text-emerald-500 font-bold w-4 h-4 flex items-center justify-center text-xs">W</span>
                    <span dir="ltr">{store.whatsapp || <span className="text-slate-400 text-xs">غير متوفر</span>}</span>
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-slate-500 dark:text-slate-400 mb-1">العنوان التفصيلي</dt>
                  <dd className="text-slate-900 dark:text-white">
                    {store.address_ar || <span className="text-slate-400">غير متوفر</span>}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">الوسائط</h3>
            </div>
            <div className="p-6">
              <StoreMediaGallery logo={store.logo} cover={store.cover} gallery={store.gallery} />
            </div>
          </div>

        </div>

        {/* Right Column (Meta) */}
        <div className="space-y-6">
          
          {/* Owner Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">معلومات المالك</h3>
            </div>
            <div className="p-6">
              {store.owner ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <UserIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900 dark:text-white">{store.owner.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{store.owner.email}</div>
                    </div>
                  </div>
                  <Link 
                    href={`/users/${store.owner.public_id}`}
                    className="flex w-full items-center justify-center h-9 rounded-md border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    عرض صفحة المستخدم
                  </Link>
                </div>
              ) : (
                <div className="text-center text-slate-500 text-sm py-4">معلومات المالك غير متوفرة</div>
              )}
            </div>
          </div>

          {/* Public Presence & QR */}
          {(store.slug || links || qrObjectUrl) && (
            <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">الروابط و QR</h3>
                {isLoadingLinks && <span className="text-xs text-emerald-600">جاري التحميل...</span>}
              </div>
              <div className="p-6 space-y-4">
                {links && (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs text-emerald-800 dark:text-emerald-300 mb-1 block">رابط الويب</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={links.web_url} dir="ltr" className="h-9 text-xs bg-white/50 dark:bg-slate-900/50" />
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => copyToClipboard(links.web_url, "تم نسخ الرابط بنجاح")}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs text-emerald-800 dark:text-emerald-300 mb-1 block">الرابط العميق (التطبيق)</Label>
                      <div className="flex gap-2">
                        <Input readOnly value={links.deep_link} dir="ltr" className="h-9 text-xs bg-white/50 dark:bg-slate-900/50" />
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={() => copyToClipboard(links.deep_link, "تم نسخ الرابط العميق بنجاح")}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {qrObjectUrl && (
                  <div className="pt-4 border-t border-emerald-100 dark:border-emerald-800">
                    <Label className="text-xs text-emerald-800 dark:text-emerald-300 mb-3 block text-center">رمز الاستجابة السريعة (QR Code)</Label>
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100 w-32 h-32">
                        <img src={qrObjectUrl} alt="Store QR Code" className="w-full h-full object-contain" />
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full bg-white dark:bg-slate-900"
                      onClick={() => downloadQr(store.name_en || store.name_ar)}
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تنزيل QR (SVG)
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subscription Info */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 dark:text-white">حالة الاشتراك</h3>
            </div>
            <div className="p-6">
              {activeSubscription ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">اشتراك نشط</span>
                    <span className="text-xs text-slate-500 font-medium" dir="ltr">
                      {formatCurrency(activeSubscription.plan.price, activeSubscription.plan.currency)} / {activeSubscription.plan.duration_days} يوم
                    </span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">{activeSubscription.plan.name_ar}</div>
                  </div>
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex justify-between">
                      <span>تاريخ البدء:</span>
                      <span dir="ltr">{new Date(activeSubscription.starts_at).toLocaleDateString("en-GB")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>تاريخ الانتهاء:</span>
                      <span dir="ltr">{new Date(activeSubscription.ends_at).toLocaleDateString("en-GB")}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-3">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">لا يوجد اشتراك نشط حالياً</p>
                </div>
              )}
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">أوقات العمل</h3>
            </div>
            <div className="p-6">
              <StoreWorkingHours workingHours={store.working_hours} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

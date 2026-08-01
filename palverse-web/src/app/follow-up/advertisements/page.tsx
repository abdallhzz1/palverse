"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, CheckCircle2, XCircle, Store, Pencil } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import { adScheduleLabel, getAdScheduleStatus, placementLabels } from "@/lib/ads/ad-schedule";

function resolveBannerUrl(path?: string | null, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") || "";
  return `${base}/storage/${path}`;
}

export default function FollowUpAdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdvertisements = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get("/follow-up/advertisements");
      setAdvertisements(res.data || []);
    } catch (error) {
      console.error("Failed to load advertisements:", error);
      toast.error("حدث خطأ أثناء تحميل الإعلانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleDelete = async (publicId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟ لا يمكن التراجع عن هذه الخطوة.")) return;
    try {
      await apiClient.delete(`/follow-up/advertisements/${publicId}`);
      toast.success("تم حذف الإعلان بنجاح");
      fetchAdvertisements();
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const toggleActive = async (ad: any) => {
    try {
      await apiClient.put(`/follow-up/advertisements/${ad.public_id}`, {
        is_active: !ad.is_active,
      });
      toast.success(ad.is_active ? "تم إيقاف الإعلان" : "تم تنشيط الإعلان بنجاح");
      fetchAdvertisements();
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تغيير حالة الإعلان");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">الإعلانات الممولة</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            تحكم كامل بالحملات من المتابعة: إنشاء، تعديل، تفعيل/إيقاف، وحذف. البنر يظهر في الرئيسية
            وصفحة المتاجر وبروفايل المحل؛ إبراز المتجر يظهر كبطاقة/شارة ممولة.
          </p>
        </div>
        <Link
          href="/follow-up/advertisements/new"
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#1E7D4E] px-6 py-2.5 font-bold text-white transition-colors hover:bg-[#0F3D2E]"
        >
          <Plus className="h-5 w-5" />
          إضافة إعلان جديد
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E7D4E] border-t-transparent" />
        </div>
      ) : advertisements.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center dark:border-gray-800 dark:bg-[#1a1a1a]">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 dark:bg-gray-800">
            <Megaphone className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">لا توجد إعلانات</h3>
          <p className="mb-6 text-gray-500">لم تقم بإضافة أي إعلانات ممولة بعد</p>
          <Link
            href="/follow-up/advertisements/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E7D4E] px-6 py-2 font-bold text-white hover:bg-[#0F3D2E]"
          >
            <Plus className="h-5 w-5" />
            إضافة إعلان جديد
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-[#1a1a1a]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">المتجر</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">البداية</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">النهاية</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">المبلغ</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">الظهور</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">التفعيل</th>
                  <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {advertisements.map((ad: any) => {
                  const img = resolveBannerUrl(ad.image_path, ad.image_url);
                  const placeText = placementLabels(ad.placements).slice(0, 2).join(" · ");
                  return (
                    <tr key={ad.public_id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {ad.ad_type === "banner" && img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="h-10 w-12 rounded-lg border object-cover" />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF3EC] text-[#1E7D4E] dark:bg-[#0F3D2E] dark:text-[#EAF3EC]">
                              <Store className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
                              {ad.store?.name_ar || ad.store?.name_en}
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] ${
                                  ad.ad_type === "banner"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                                }`}
                              >
                                {ad.ad_type === "banner" ? "بنر إعلاني" : "إبراز المتجر"}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500">{placeText || ad.notes || "لا يوجد ملاحظات"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Intl.DateTimeFormat("ar-EG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(ad.start_date))}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                        {new Intl.DateTimeFormat("ar-EG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(ad.end_date))}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#1E7D4E]">{ad.amount_paid} ₪</td>
                      <td className="px-6 py-4">
                        {(() => {
                          const status =
                            (ad.public_status as string | undefined) ||
                            (ad.homepage_status as string | undefined) ||
                            getAdScheduleStatus(ad);
                          const meta =
                            status === "hidden"
                              ? { label: "مخفي عن الموقع", className: "bg-orange-100 text-orange-700" }
                              : adScheduleLabel(
                                  status === "live" ||
                                    status === "scheduled" ||
                                    status === "expired" ||
                                    status === "paused"
                                    ? status
                                    : "paused"
                                );
                          const reasons = Array.isArray(ad.public_reasons)
                            ? ad.public_reasons.join(", ")
                            : Array.isArray(ad.homepage_reasons)
                              ? ad.homepage_reasons.join(", ")
                              : "";
                          return (
                            <span
                              title={reasons || undefined}
                              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${meta.className}`}
                            >
                              {meta.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => toggleActive(ad)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                            ad.is_active
                              ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {ad.is_active ? (
                            <>
                              <CheckCircle2 className="h-4 w-4" />
                              مفعّل
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              متوقف
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/follow-up/advertisements/${ad.public_id}/edit`}
                            className="rounded-lg p-2 text-[#1E7D4E] transition-colors hover:bg-[#EAF3EC] dark:hover:bg-[#0F3D2E]/40"
                            title="تعديل"
                          >
                            <Pencil className="h-5 w-5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(ad.public_id)}
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="حذف"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

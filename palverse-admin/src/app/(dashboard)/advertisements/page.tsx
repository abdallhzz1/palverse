"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Plus, Trash2, CheckCircle2, XCircle, Store } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { advertisementsService, type StoreAdvertisement } from "@/services/advertisements.service";
import { normalizeApiError } from "@/lib/api/error";
import { adScheduleLabel, getAdScheduleStatus } from "@/lib/ads/ad-schedule";

function bannerImageUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") || "";
  return `${base}/storage/${path}`;
}

export default function AdminAdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<StoreAdvertisement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdvertisements = async () => {
    setIsLoading(true);
    try {
      const res = await advertisementsService.list();
      setAdvertisements(res.data || []);
    } catch (error) {
      toast.error(normalizeApiError(error).message || "حدث خطأ أثناء تحميل الإعلانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvertisements();
  }, []);

  const handleDelete = async (publicId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الإعلان؟")) return;
    try {
      await advertisementsService.remove(publicId);
      toast.success("تم حذف الإعلان بنجاح");
      fetchAdvertisements();
    } catch (error) {
      toast.error(normalizeApiError(error).message || "حدث خطأ أثناء الحذف");
    }
  };

  const toggleActive = async (ad: StoreAdvertisement) => {
    try {
      await advertisementsService.setActive(ad.public_id, !ad.is_active);
      toast.success(ad.is_active ? "تم إيقاف الإعلان" : "تم تنشيط الإعلان بنجاح");
      fetchAdvertisements();
    } catch (error) {
      toast.error(normalizeApiError(error).message || "حدث خطأ أثناء تغيير حالة الإعلان");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">
            الإعلانات الممولة
          </h2>
          <p className="mt-1 text-muted-foreground">
            يظهر الإعلان على الرئيسية فقط إذا كان مفعّلاً وتاريخ اليوم ضمن فترة البداية والنهاية.
          </p>
        </div>
        <Button asChild className="bg-[#1E7D4E] hover:bg-[#0F3D2E]">
          <Link href="/advertisements/new">
            <Plus className="ml-2 h-4 w-4" />
            إضافة إعلان جديد
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E7D4E] border-t-transparent" />
        </div>
      ) : advertisements.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Megaphone className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-lg font-bold">لا توجد إعلانات</h3>
          <p className="mb-6 text-muted-foreground">لم يتم إضافة أي إعلانات ممولة بعد</p>
          <Button asChild className="bg-[#1E7D4E] hover:bg-[#0F3D2E]">
            <Link href="/advertisements/new">
              <Plus className="ml-2 h-4 w-4" />
              إضافة إعلان جديد
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/40 dark:border-slate-800">
                  <th className="px-6 py-4 text-right font-semibold">المتجر</th>
                  <th className="px-6 py-4 text-right font-semibold">البداية</th>
                  <th className="px-6 py-4 text-right font-semibold">النهاية</th>
                  <th className="px-6 py-4 text-right font-semibold">المبلغ</th>
                  <th className="px-6 py-4 text-right font-semibold">الظهور</th>
                  <th className="px-6 py-4 text-right font-semibold">التفعيل</th>
                  <th className="px-6 py-4 text-right font-semibold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-800">
                {advertisements.map((ad) => {
                  const img = bannerImageUrl(ad.image_path);
                  return (
                    <tr key={ad.public_id} className="hover:bg-muted/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {ad.ad_type === "banner" && img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={img}
                              alt=""
                              className="h-10 w-12 rounded-lg border object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF3EC] text-[#1E7D4E]">
                              <Store className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2 font-bold">
                              {ad.store?.name_ar || ad.store?.name_en || "—"}
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] ${
                                  ad.ad_type === "banner"
                                    ? "bg-violet-100 text-violet-700"
                                    : "bg-sky-100 text-sky-700"
                                }`}
                              >
                                {ad.ad_type === "banner" ? "بنر إعلاني" : "إبراز المتجر"}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">{ad.notes || "لا يوجد ملاحظات"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {new Intl.DateTimeFormat("ar-EG", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }).format(new Date(ad.start_date))}
                      </td>
                      <td className="px-6 py-4 text-sm">
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
                            (ad as StoreAdvertisement & { homepage_status?: string }).homepage_status ||
                            getAdScheduleStatus(ad);
                          const meta =
                            status === "hidden"
                              ? { label: "مخفي عن الرئيسية", className: "bg-orange-100 text-orange-700" }
                              : adScheduleLabel(
                                  status === "live" ||
                                    status === "scheduled" ||
                                    status === "expired" ||
                                    status === "paused"
                                    ? status
                                    : "paused"
                                );
                          const reasons = (ad as StoreAdvertisement & { homepage_reasons?: string[] })
                            .homepage_reasons;
                          return (
                            <span
                              title={Array.isArray(reasons) ? reasons.join(", ") : undefined}
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
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                            ad.is_active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-muted text-muted-foreground"
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
                        <button
                          type="button"
                          onClick={() => handleDelete(ad.public_id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="حذف"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
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

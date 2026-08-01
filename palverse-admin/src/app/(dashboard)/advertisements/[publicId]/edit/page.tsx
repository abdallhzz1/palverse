"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Save,
  Store,
  Calendar,
  DollarSign,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { advertisementsService } from "@/services/advertisements.service";
import { apiClient } from "@/lib/api/client";
import { normalizeApiError } from "@/lib/api/error";
import { bannerImageUrl, placementLabels, BANNER_PLACEMENTS, getBannerPlacement } from "@/lib/ads/ad-schedule";

export default function EditAdminAdvertisementPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState<{ public_id: string; name_ar?: string; name_en?: string }[]>([]);
  const [formData, setFormData] = useState({
    store_public_id: "",
    ad_type: "featured_store",
    placement: "home_hero",
    start_date: "",
    end_date: "",
    amount_paid: "",
    notes: "",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      advertisementsService.show(publicId),
      apiClient.get("/stores", { params: { per_page: 100 } }),
    ])
      .then(([adRes, storesRes]) => {
        const ad = adRes.data;
        setFormData({
          store_public_id: ad.store?.public_id || "",
          ad_type: ad.ad_type,
          placement: ad.placement || "home_hero",
          start_date: (ad.start_date || "").slice(0, 10),
          end_date: (ad.end_date || "").slice(0, 10),
          amount_paid: String(ad.amount_paid ?? ""),
          notes: ad.notes || "",
          is_active: Boolean(ad.is_active),
        });
        setImagePreview(bannerImageUrl(ad.image_path, ad.image_url));
        setStores(
          (storesRes as { data?: { public_id: string; name_ar?: string; name_en?: string }[] }).data ||
            []
        );
      })
      .catch((error) => {
        toast.error(normalizeApiError(error).message || "تعذر تحميل الإعلان");
        router.push("/advertisements");
      })
      .finally(() => setIsLoading(false));
  }, [publicId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append("store_public_id", formData.store_public_id);
      data.append("ad_type", formData.ad_type);
      data.append("start_date", formData.start_date);
      data.append("end_date", formData.end_date);
      data.append("amount_paid", formData.amount_paid);
      data.append("notes", formData.notes ?? "");
      data.append("is_active", formData.is_active ? "1" : "0");
      if (formData.ad_type === "banner") {
        data.append("placement", formData.placement);
      }
      if (imageFile) data.append("image", imageFile);

      await advertisementsService.update(publicId, data);
      toast.success("تم تحديث الإعلان بنجاح");
      router.push("/advertisements");
      router.refresh();
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.details && Object.keys(normalized.details).length > 0) {
        toast.error(`خطأ في البيانات: ${Object.values(normalized.details).flat().join(" | ")}`);
      } else {
        toast.error(normalized.message || "حدث خطأ أثناء حفظ الإعلان");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value } = target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: target.checked }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1E7D4E] border-t-transparent" />
      </div>
    );
  }

  const selectedSlot = getBannerPlacement(formData.placement);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/advertisements">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">تعديل الإعلان</h2>
          <p className="mt-1 text-muted-foreground">
            كل بنر مربوط بموضع واحد ومقاس محدد — لا يُعرض في مواضع أخرى
          </p>
        </div>
      </div>

      {formData.ad_type === "banner" && selectedSlot ? (
        <div className="rounded-2xl border border-[#EAF3EC] bg-[#EAF3EC]/40 p-4 text-sm text-[#0F3D2E]">
          <p className="font-bold">{selectedSlot.label_ar}</p>
          <p className="mt-1 text-xs text-[#5F7B6A]">
            النسبة {selectedSlot.aspect_ratio} · المقاس المقترح {selectedSlot.recommended_size}
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-[#EAF3EC] bg-[#EAF3EC]/40 p-4 text-sm text-[#0F3D2E]">
          <p className="font-bold">إبراز المتجر</p>
          <p className="mt-1 text-xs text-[#5F7B6A]">
            {placementLabels([
              "home_featured_stores",
              "stores_list_featured",
              "stores_list_sponsored_badge",
            ]).join(" · ")}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-sm md:p-8 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold">
            <LayoutTemplate className="h-4 w-4 text-[#1E7D4E]" />
            نوع الإعلان
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {(
              [
                {
                  value: "featured_store",
                  title: "إبراز المتجر",
                  desc: "بطاقة مميزة في الرئيسية وصفحة المتاجر",
                },
                {
                  value: "banner",
                  title: "بنر إعلاني",
                  desc: "صورة بحجم موضع محدد تختاره أدناه",
                },
              ] as const
            ).map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-center rounded-xl border p-4 transition-colors ${
                  formData.ad_type === option.value
                    ? "border-[#1E7D4E] bg-[#EAF3EC]"
                    : "border-border hover:bg-muted/40"
                }`}
              >
                <input
                  type="radio"
                  name="ad_type"
                  value={option.value}
                  checked={formData.ad_type === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="w-full">
                  <div className="font-bold">{option.title}</div>
                  <div className="text-sm text-muted-foreground">{option.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {formData.ad_type === "banner" && (
          <div className="space-y-2">
            <label className="text-sm font-bold">موضع البنر والمقاس</label>
            <select
              name="placement"
              value={formData.placement}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 outline-none focus:border-[#1E7D4E]"
            >
              {BANNER_PLACEMENTS.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label_ar} — {slot.aspect_ratio} ({slot.recommended_size})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold">
            <Store className="h-4 w-4 text-[#1E7D4E]" />
            المتجر المرتبط بالإعلان
          </label>
          <select
            name="store_public_id"
            value={formData.store_public_id}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 outline-none focus:border-[#1E7D4E]"
          >
            <option value="">اختر المتجر</option>
            {stores.map((store) => (
              <option key={store.public_id} value={store.public_id}>
                {store.name_ar || store.name_en}
              </option>
            ))}
          </select>
        </div>

        {formData.ad_type === "banner" && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold">
              <ImageIcon className="h-4 w-4 text-[#1E7D4E]" />
              صورة البنر
            </label>
            <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted md:h-64">
                    <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover" />
                  </div>
                  <label htmlFor="banner-image-edit" className="cursor-pointer text-sm font-bold text-[#1E7D4E] hover:underline">
                    استبدال الصورة
                  </label>
                  <input
                    type="file"
                    id="banner-image-edit"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="banner-image-edit"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="banner-image-edit" className="flex cursor-pointer flex-col items-center gap-2">
                    <span className="font-medium text-[#1E7D4E]">اختر صورة البنر</span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold">
              <Calendar className="h-4 w-4 text-[#1E7D4E]" />
              تاريخ البداية
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 outline-none focus:border-[#1E7D4E]"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold">
              <Calendar className="h-4 w-4 text-[#1E7D4E]" />
              تاريخ النهاية
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              min={formData.start_date}
              className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 outline-none focus:border-[#1E7D4E]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold">
            <DollarSign className="h-4 w-4 text-[#1E7D4E]" />
            المبلغ المدفوع (شيكل)
          </label>
          <input
            type="number"
            name="amount_paid"
            value={formData.amount_paid}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 outline-none focus:border-[#1E7D4E]"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold">
            <FileText className="h-4 w-4 text-[#1E7D4E]" />
            ملاحظات
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 outline-none focus:border-[#1E7D4E]"
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-border p-4">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-[#1E7D4E] focus:ring-[#1E7D4E]"
          />
          <span className="text-sm font-bold">الإعلان مفعّل ويعرض على الموقع عند حلول الفترة</span>
        </label>

        <div className="flex items-center justify-end gap-3 border-t border-border pt-6">
          <Button asChild variant="ghost">
            <Link href="/advertisements">إلغاء</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#1E7D4E] hover:bg-[#0F3D2E]">
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="ml-2 h-4 w-4" />
            )}
            حفظ التعديلات
          </Button>
        </div>
      </form>
    </div>
  );
}

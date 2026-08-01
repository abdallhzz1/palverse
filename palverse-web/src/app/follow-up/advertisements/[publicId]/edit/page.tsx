"use client";

import { useEffect, useState, use } from "react";
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import Image from "next/image";
import { placementLabels, BANNER_PLACEMENTS, getBannerPlacement } from "@/lib/ads/ad-schedule";

function resolveBannerUrl(path?: string | null, imageUrl?: string | null) {
  if (imageUrl) return imageUrl;
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/api\/v1\/?$/, "") || "";
  return `${base}/storage/${path}`;
}

export default function EditFollowUpAdvertisementPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
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
      apiClient.get(`/follow-up/advertisements/${publicId}`),
      apiClient.get("/stores?per_page=100"),
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
        setImagePreview(resolveBannerUrl(ad.image_path, ad.image_url));
        setStores(storesRes.data || []);
      })
      .catch(() => {
        toast.error("تعذر تحميل الإعلان");
        router.push("/follow-up/advertisements");
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

      await apiClient.post(`/follow-up/advertisements/${publicId}`, data, { timeout: 60000 });
      toast.success("تم تحديث الإعلان بنجاح");
      router.push("/follow-up/advertisements");
      router.refresh();
    } catch (error: any) {
      const fieldErrors = error?.data?.errors;
      if (fieldErrors && typeof fieldErrors === "object") {
        toast.error(`خطأ في البيانات: ${Object.values(fieldErrors).flat().join(" | ")}`);
      } else {
        toast.error(error?.message || "حدث خطأ أثناء حفظ الإعلان");
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
        <Link
          href="/follow-up/advertisements"
          className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <ArrowRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تعديل الإعلان</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            كل بنر مربوط بموضع واحد ومقاس محدد
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-[#EAF3EC] bg-[#EAF3EC]/50 p-4 text-sm text-[#0F3D2E]">
        {formData.ad_type === "banner" && selectedSlot ? (
          <>
            <p className="font-bold">{selectedSlot.label_ar}</p>
            <p className="mt-1 text-xs text-[#5F7B6A]">
              النسبة {selectedSlot.aspect_ratio} · المقاس المقترح {selectedSlot.recommended_size}
            </p>
          </>
        ) : (
          <>
            <p className="font-bold">إبراز المتجر</p>
            <p className="mt-1 text-xs text-[#5F7B6A]">
              {placementLabels([
                "home_featured_stores",
                "stores_list_featured",
                "stores_list_sponsored_badge",
              ]).join(" · ")}
            </p>
          </>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm md:p-8 dark:border-gray-800 dark:bg-[#1a1a1a]"
      >
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
            <LayoutTemplate className="h-4 w-4 text-[#1E7D4E]" />
            نوع الإعلان
          </label>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label
              className={`flex cursor-pointer items-center rounded-xl border p-4 ${
                formData.ad_type === "featured_store"
                  ? "border-[#1E7D4E] bg-[#EAF3EC]"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                name="ad_type"
                value="featured_store"
                checked={formData.ad_type === "featured_store"}
                onChange={handleChange}
                className="sr-only"
              />
              <div>
                <div className="font-bold">إبراز المتجر</div>
                <div className="text-sm text-gray-500">بطاقة مميزة في الرئيسية وصفحة المتاجر</div>
              </div>
            </label>
            <label
              className={`flex cursor-pointer items-center rounded-xl border p-4 ${
                formData.ad_type === "banner"
                  ? "border-[#1E7D4E] bg-[#EAF3EC]"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              <input
                type="radio"
                name="ad_type"
                value="banner"
                checked={formData.ad_type === "banner"}
                onChange={handleChange}
                className="sr-only"
              />
              <div>
                <div className="font-bold">بنر إعلاني</div>
                <div className="text-sm text-gray-500">صورة بحجم موضع محدد تختاره أدناه</div>
              </div>
            </label>
          </div>
        </div>

        {formData.ad_type === "banner" && (
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">موضع البنر والمقاس</label>
            <select
              name="placement"
              value={formData.placement}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
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
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
            <Store className="h-4 w-4 text-[#1E7D4E]" />
            المتجر المرتبط
          </label>
          <select
            name="store_public_id"
            value={formData.store_public_id}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
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
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <ImageIcon className="h-4 w-4 text-[#1E7D4E]" />
              صورة البنر
            </label>
            <div className="rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100 md:h-64">
                    <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover" />
                  </div>
                  <label htmlFor="fu-banner-edit" className="cursor-pointer text-sm font-bold text-[#1E7D4E]">
                    استبدال الصورة
                  </label>
                  <input id="fu-banner-edit" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>
              ) : (
                <>
                  <input id="fu-banner-edit" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <label htmlFor="fu-banner-edit" className="cursor-pointer font-medium text-[#1E7D4E]">
                    اختر صورة البنر
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
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
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
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
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800"
          />
        </div>

        <label className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 dark:border-gray-700">
          <input
            type="checkbox"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="h-4 w-4 rounded border-gray-300 text-[#1E7D4E]"
          />
          <span className="text-sm font-bold">الإعلان مفعّل ويعرض على الموقع عند حلول الفترة</span>
        </label>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6 dark:border-gray-800">
          <Link href="/follow-up/advertisements" className="px-4 py-2 text-sm font-bold text-gray-600">
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1E7D4E] px-6 py-2.5 font-bold text-white hover:bg-[#0F3D2E] disabled:opacity-60"
          >
            {isSubmitting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            حفظ التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}

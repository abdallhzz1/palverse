"use client";

import { useEffect, useState } from "react";
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
import { defaultAdDateRange, BANNER_PLACEMENTS, getBannerPlacement } from "@/lib/ads/ad-schedule";

export default function NewAdminAdvertisementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState<{ public_id: string; name_ar?: string; name_en?: string }[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [formData, setFormData] = useState({
    store_public_id: "",
    ad_type: "featured_store",
    placement: "home_hero",
    ...defaultAdDateRange(30),
    amount_paid: "",
    notes: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get("/stores", { params: { per_page: 100 } })
      .then((res: { data?: { public_id: string; name_ar?: string; name_en?: string }[] }) => {
        setStores(res.data || []);
      })
      .catch(() => toast.error("حدث خطأ أثناء تحميل قائمة المتاجر"))
      .finally(() => setIsLoadingStores(false));
  }, []);

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

      if (formData.ad_type === "banner") {
        if (!formData.placement) throw new Error("اختر موضع البنر");
        data.append("placement", formData.placement);
        if (!imageFile) throw new Error("يجب رفع صورة للبنر الإعلاني");
        data.append("image", imageFile);
      }

      await advertisementsService.create(data);
      toast.success("تم إنشاء الإعلان وتفعيله بنجاح");
      router.push("/advertisements");
      router.refresh();
    } catch (error) {
      const normalized = normalizeApiError(error);
      if (normalized.details && Object.keys(normalized.details).length > 0) {
        const messages = Object.values(normalized.details).flat().join(" | ");
        toast.error(`خطأ في البيانات: ${messages}`);
      } else {
        toast.error(normalized.message || (error as Error).message || "حدث خطأ أثناء حفظ الإعلان");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon" className="rounded-full">
          <Link href="/advertisements">
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">إضافة إعلان جديد</h2>
          <p className="mt-1 text-muted-foreground">
            لكل بنر موضع واحد ومقاس موصى به. لإبراز المتجر لا حاجة لصورة بنر.
          </p>
        </div>
      </div>

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
                  desc: "بطاقة مميزة في الرئيسية وصفحة المتاجر + شارة ممول",
                },
                {
                  value: "banner",
                  title: "بنر إعلاني تصويري",
                  desc: "بنر في الرئيسية والمتاجر وشريط بروفايل المحل",
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
            <label className="flex items-center gap-2 text-sm font-bold">موضع البنر والمقاس</label>
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
            {getBannerPlacement(formData.placement) ? (
              <p className="text-xs text-muted-foreground">
                ارفع صورة بنسبة{" "}
                <span className="font-bold text-[#1E7D4E]">
                  {getBannerPlacement(formData.placement)?.aspect_ratio}
                </span>{" "}
                تقريباً، المقاس المقترح{" "}
                <span className="font-bold">
                  {getBannerPlacement(formData.placement)?.recommended_size}
                </span>
                . هذا البنر يظهر في هذا الموضع فقط.
              </p>
            ) : null}
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
            disabled={isLoadingStores}
            className="w-full rounded-xl border border-border bg-muted/30 px-4 py-3 outline-none focus:border-[#1E7D4E] focus:ring-2 focus:ring-[#1E7D4E]/20"
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
              صورة الإعلان (البنر)
            </label>
            <div className="rounded-2xl border-2 border-dashed border-border p-6 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative h-48 w-full overflow-hidden rounded-xl bg-muted md:h-64">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-sm font-bold text-red-500 hover:underline"
                  >
                    حذف الصورة واختيار أخرى
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="banner-image"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <label htmlFor="banner-image" className="flex cursor-pointer flex-col items-center gap-2">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF3EC] text-[#1E7D4E]">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                    <span className="font-medium text-[#1E7D4E]">اضغط هنا لاختيار صورة</span>
                    <span className="text-xs text-muted-foreground">
                      نسبة {getBannerPlacement(formData.placement)?.aspect_ratio || "الموضع"} — بحد أقصى 10MB
                    </span>
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
            ملاحظات (اختياري)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full resize-none rounded-xl border border-border bg-muted/30 px-4 py-3 outline-none focus:border-[#1E7D4E]"
          />
        </div>

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
            حفظ وتفعيل
          </Button>
        </div>
      </form>
    </div>
  );
}

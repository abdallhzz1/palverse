"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Upload, Camera } from "lucide-react";
import { StoreDetailNav } from "@/components/stores/store-detail-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useStoreOfferDetails, useStoreOfferMutations } from "@/hooks/use-store-offers";
import type { NormalizedApiError } from "@/lib/api/error";
import type { StoreOfferPayload } from "@/types/store";

interface OfferFormState {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  price: string;
  old_price: string;
  currency: string;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

const INITIAL_STATE: OfferFormState = {
  title_ar: "",
  title_en: "",
  description_ar: "",
  description_en: "",
  price: "",
  old_price: "",
  currency: "ILS",
  is_active: true,
  starts_at: "",
  ends_at: "",
};

// Converts an ISO datetime string to the "YYYY-MM-DDTHH:mm" format expected by <input type="datetime-local">.
function formatForInput(dateStr: string | null) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

export default function EditOfferPage({ params }: { params: Promise<{ publicId: string; offerId: string }> }) {
  const { publicId, offerId } = use(params);
  const router = useRouter();
  const { offer, isLoading, error: loadError } = useStoreOfferDetails(publicId, offerId);
  const { update, isSubmitting } = useStoreOfferMutations(publicId);

  const [formData, setFormData] = useState<OfferFormState>(INITIAL_STATE);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [apiError, setApiError] = useState<NormalizedApiError | null>(null);

  useEffect(() => {
    if (!offer) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      title_ar: offer.title_ar,
      title_en: offer.title_en || "",
      description_ar: offer.description_ar || "",
      description_en: offer.description_en || "",
      price: offer.price != null ? String(offer.price) : "",
      old_price: offer.old_price != null ? String(offer.old_price) : "",
      currency: offer.currency || "ILS",
      is_active: offer.is_active,
      starts_at: formatForInput(offer.starts_at),
      ends_at: formatForInput(offer.ends_at),
    });
    if (offer.image_url) {
      setImagePreview(offer.image_url);
    }
  }, [offer]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const payload: StoreOfferPayload = {
      title_ar: formData.title_ar,
      title_en: formData.title_en || null,
      description_ar: formData.description_ar || null,
      description_en: formData.description_en || null,
      price: formData.price || null,
      old_price: formData.old_price || null,
      currency: formData.currency,
      is_active: formData.is_active,
      starts_at: formData.starts_at || null,
      ends_at: formData.ends_at || null,
    };

    if (imageFile) {
      payload.image = imageFile;
    }

    try {
      await update(offerId, payload);
      router.push(`/stores/${publicId}/offers`);
    } catch (err) {
      setApiError(err as NormalizedApiError);
      window.scrollTo(0, 0);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (loadError || !offer) {
    return (
      <div className="space-y-6">
        <Link href={`/stores/${publicId}/offers`} className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors">
          <ArrowRight className="w-4 h-4 ml-1" />
          العودة إلى العروض
        </Link>
        <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-6 rounded-lg border border-red-100 dark:border-red-900/40 text-center">
          فشل تحميل بيانات العرض.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/stores/${publicId}/offers`}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">تعديل العرض</h2>
        </div>
      </div>

      <StoreDetailNav publicId={publicId} />

      <form
        onSubmit={handleSubmit}
        className="bg-card dark:bg-slate-900 rounded-xl border border-border dark:border-slate-800 p-6 md:p-8 shadow-sm space-y-8"
      >
        {apiError && (
          <div className="bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 p-4 rounded-lg text-sm font-semibold border border-red-100 dark:border-red-900/40">
            <p>{apiError.message}</p>
            {apiError.details && (
              <ul className="list-disc pr-5 mt-1 font-normal">
                {Object.values(apiError.details).flat().map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground dark:text-white border-b border-border dark:border-slate-800 pb-2">
              صورة العرض
            </h3>

            <div className="flex flex-col gap-4">
              <div className="h-48 w-full relative rounded-xl border border-border dark:border-slate-800 overflow-hidden flex items-center justify-center bg-muted dark:bg-slate-800">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill unoptimized className="object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                )}
              </div>
              <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-[#1E7D4E] dark:text-emerald-400 rounded-lg font-bold hover:bg-[#1E7D4E] hover:text-white transition-colors w-max">
                <Upload className="w-4 h-4" />
                تغيير الصورة
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-foreground dark:text-white border-b border-border dark:border-slate-800 pb-2">
              تفاصيل العرض
            </h3>

            <div className="space-y-2">
              <Label htmlFor="title_ar">عنوان العرض (بالعربية) *</Label>
              <Input
                id="title_ar"
                required
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="title_en">عنوان العرض (بالإنجليزية)</Label>
              <Input
                id="title_en"
                dir="ltr"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">السعر الحالي *</Label>
                <div className="relative">
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    dir="ltr"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">{formData.currency}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="old_price">السعر القديم</Label>
                <div className="relative">
                  <Input
                    id="old_price"
                    type="number"
                    step="0.01"
                    min="0"
                    dir="ltr"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                  />
                  <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">{formData.currency}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="starts_at">تاريخ البدء *</Label>
                <Input
                  id="starts_at"
                  type="datetime-local"
                  required
                  value={formData.starts_at}
                  onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ends_at">تاريخ الانتهاء *</Label>
                <Input
                  id="ends_at"
                  type="datetime-local"
                  required
                  value={formData.ends_at}
                  onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description_ar">الوصف (بالعربية)</Label>
              <Textarea
                id="description_ar"
                rows={3}
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
              />
            </div>

            <div className="flex items-center justify-between gap-3 mt-4 p-4 border border-border dark:border-slate-800 rounded-xl">
              <Label htmlFor="is_active" className="font-bold text-foreground dark:text-white cursor-pointer">
                تفعيل العرض
              </Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-slate-800">
          <Button type="button" variant="outline" onClick={() => router.push(`/stores/${publicId}/offers`)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white">
            {isSubmitting ? "جاري التحديث..." : "تحديث العرض"}
          </Button>
        </div>
      </form>
    </div>
  );
}

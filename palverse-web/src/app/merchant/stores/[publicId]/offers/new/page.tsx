"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Tag, Upload, Camera } from "lucide-react";
import { merchantService } from "@/services/merchant.service";
import Image from "next/image";

export default function NewOfferPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
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
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload: Record<string, any> = { ...formData };
      
      // Clean up empty optional fields
      Object.keys(payload).forEach(key => {
        if (payload[key] === "") payload[key] = null;
      });

      if (imageFile) {
        payload.image = imageFile;
      }

      await merchantService.createOffer(resolvedParams.publicId, payload);
      router.push(`/merchant/stores/${resolvedParams.publicId}/offers`);
    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setError(err.data.errors[firstErrorKey][0]);
      } else {
        setError(err.message || "فشل في حفظ العرض");
      }
    } finally {
      setIsSaving(false);
      window.scrollTo(0,0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/merchant/stores/${resolvedParams.publicId}/offers`} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
          <ArrowRight className="w-6 h-6 text-[#0F3D2E] dark:text-[#EAF3EC]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
            إضافة عرض جديد
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#171717] rounded-2xl p-6 md:p-8 border border-[#EAF3EC] dark:border-[#1F2522] shadow-sm space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-semibold border border-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">صورة العرض</h2>
            
            <div className="flex flex-col gap-4">
              <div className="h-48 w-full relative rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-[#252525]">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                ) : (
                  <Camera className="w-12 h-12 text-gray-300" />
                )}
              </div>
              <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2 bg-[#EAF3EC] dark:bg-[#0F3D2E]/50 text-[#1E7D4E] dark:text-[#EAF3EC] rounded-lg font-bold hover:bg-[#1E7D4E] hover:text-white transition-colors w-max">
                <Upload className="w-4 h-4" />
                اختيار صورة
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] border-b border-[#EAF3EC] dark:border-[#1F2522] pb-2">تفاصيل العرض</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان العرض (بالعربية) *</label>
              <input type="text" required value={formData.title_ar} onChange={e => setFormData({ ...formData, title_ar: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">عنوان العرض (بالإنجليزية)</label>
              <input type="text" dir="ltr" value={formData.title_en} onChange={e => setFormData({ ...formData, title_en: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر الحالي *</label>
                <div className="relative">
                  <input type="number" step="0.01" min="0" required dir="ltr" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{formData.currency}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">السعر القديم</label>
                <div className="relative">
                  <input type="number" step="0.01" min="0" dir="ltr" value={formData.old_price} onChange={e => setFormData({ ...formData, old_price: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
                  <span className="absolute left-3 top-2.5 text-gray-500 text-sm">{formData.currency}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ البدء *</label>
                <input type="datetime-local" required value={formData.starts_at} onChange={e => setFormData({ ...formData, starts_at: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">تاريخ الانتهاء *</label>
                <input type="datetime-local" required value={formData.ends_at} onChange={e => setFormData({ ...formData, ends_at: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">الوصف (بالعربية)</label>
              <textarea rows={3} value={formData.description_ar} onChange={e => setFormData({ ...formData, description_ar: e.target.value })} className="w-full px-4 py-2 border rounded-xl dark:bg-[#1a1a1a] dark:border-gray-700 focus:ring-[#1E7D4E]" />
            </div>

            <div className="flex items-center gap-3 mt-4 p-4 border border-gray-200 dark:border-gray-800 rounded-xl">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 text-[#1E7D4E] rounded border-gray-300 focus:ring-[#1E7D4E]"
              />
              <label htmlFor="is_active" className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] cursor-pointer">
                تفعيل العرض
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#EAF3EC] dark:border-[#1F2522]">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "إضافة العرض"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

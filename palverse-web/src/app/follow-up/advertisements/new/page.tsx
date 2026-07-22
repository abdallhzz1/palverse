"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Save, Store, Calendar, DollarSign, FileText, Image as ImageIcon, LayoutTemplate } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";
import Image from "next/image";

export default function NewAdvertisementPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);

  const [formData, setFormData] = useState({
    store_public_id: "",
    ad_type: "featured_store",
    start_date: "",
    end_date: "",
    amount_paid: "",
    notes: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const publicStoresRes = await apiClient.get('/stores?per_page=100');
        setStores(publicStoresRes.data || []);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
        toast.error("حدث خطأ أثناء تحميل قائمة المتاجر");
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('store_public_id', formData.store_public_id);
      data.append('ad_type', formData.ad_type);
      data.append('start_date', formData.start_date);
      data.append('end_date', formData.end_date);
      data.append('amount_paid', formData.amount_paid);
      if (formData.notes) data.append('notes', formData.notes);
      
      if (formData.ad_type === 'banner' && imageFile) {
        data.append('image', imageFile);
      } else if (formData.ad_type === 'banner' && !imageFile) {
        throw new Error("يجب رفع صورة للبنر الإعلاني");
      }

      await apiClient.post('/follow-up/advertisements', data);
      toast.success("تم إنشاء الإعلان بنجاح");
      router.refresh();
      router.push('/follow-up/advertisements');
    } catch (error: any) {
      console.error("Full Error:", error);
      if (error.data && error.data.errors) {
        const errorMessages = Object.values(error.data.errors).flat().join(" | ");
        toast.error(`خطأ في البيانات: ${errorMessages}`);
      } else {
        toast.error(error.message || "حدث خطأ أثناء حفظ الإعلان");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/follow-up/advertisements"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <ArrowRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">إضافة إعلان جديد</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">إعداد إعلان ممول لمتجر ليعرض في الصفحة الرئيسية</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-6 md:p-8 border border-gray-100 dark:border-gray-800 space-y-6 shadow-sm">
        
        {/* Ad Type */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
            <LayoutTemplate className="w-4 h-4 text-[#1E7D4E]" />
            نوع الإعلان
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.ad_type === 'featured_store' ? 'border-[#1E7D4E] bg-[#EAF3EC] dark:bg-[#1E7D4E]/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <input type="radio" name="ad_type" value="featured_store" checked={formData.ad_type === 'featured_store'} onChange={handleChange} className="sr-only" />
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">إبراز المتجر</div>
                  <div className="text-sm text-gray-500">يظهر كبطاقة متجر مميزة في الرئيسية</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.ad_type === 'featured_store' ? 'border-[#1E7D4E]' : 'border-gray-300'}`}>
                  {formData.ad_type === 'featured_store' && <div className="w-2.5 h-2.5 bg-[#1E7D4E] rounded-full"></div>}
                </div>
              </div>
            </label>

            <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.ad_type === 'banner' ? 'border-[#1E7D4E] bg-[#EAF3EC] dark:bg-[#1E7D4E]/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <input type="radio" name="ad_type" value="banner" checked={formData.ad_type === 'banner'} onChange={handleChange} className="sr-only" />
              <div className="flex items-center justify-between w-full">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white">بنر إعلاني تصويري</div>
                  <div className="text-sm text-gray-500">تصميم يظهر في مساحة الشريك المميز</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.ad_type === 'banner' ? 'border-[#1E7D4E]' : 'border-gray-300'}`}>
                  {formData.ad_type === 'banner' && <div className="w-2.5 h-2.5 bg-[#1E7D4E] rounded-full"></div>}
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Store Selection */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
            <Store className="w-4 h-4 text-[#1E7D4E]" />
            المتجر المرتبط بالإعلان
          </label>
          <select
            name="store_public_id"
            value={formData.store_public_id}
            onChange={handleChange}
            required
            disabled={isLoadingStores}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]/20 focus:border-[#1E7D4E] transition-all"
          >
            <option value="">اختر المتجر</option>
            {stores.map((store) => (
              <option key={store.public_id} value={store.public_id}>
                {store.name_ar || store.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* Banner Upload (Conditional) */}
        {formData.ad_type === 'banner' && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <ImageIcon className="w-4 h-4 text-[#1E7D4E]" />
              صورة الإعلان (البنر)
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              {imagePreview ? (
                <div className="space-y-4">
                  <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden bg-gray-100">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                  <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-red-500 text-sm font-bold hover:underline">
                    حذف الصورة واختيار أخرى
                  </button>
                </div>
              ) : (
                <>
                  <input type="file" id="banner-image" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <label htmlFor="banner-image" className="cursor-pointer flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-full flex items-center justify-center text-[#1E7D4E]">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <span className="font-medium text-[#1E7D4E]">اضغط هنا لاختيار صورة</span>
                    <span className="text-sm text-gray-500">أو قم بالسحب والإفلات</span>
                    <span className="text-xs text-gray-400 mt-2">يفضل أن تكون الصورة بعرضية 16:9 وبحجم لا يتجاوز 10 ميجابايت</span>
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-[#1E7D4E]" />
              تاريخ البداية
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]/20 focus:border-[#1E7D4E] transition-all"
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-[#1E7D4E]" />
              تاريخ النهاية
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              min={formData.start_date}
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]/20 focus:border-[#1E7D4E] transition-all"
            />
          </div>
        </div>

        {/* Amount Paid */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
            <DollarSign className="w-4 h-4 text-[#1E7D4E]" />
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
            placeholder="مثال: 150.00"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]/20 focus:border-[#1E7D4E] transition-all"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
            <FileText className="w-4 h-4 text-[#1E7D4E]" />
            ملاحظات (اختياري)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="أضف أي تفاصيل أو ملاحظات حول هذا الإعلان..."
            rows={4}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]/20 focus:border-[#1E7D4E] transition-all resize-none"
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
          <Link
            href="/follow-up/advertisements"
            className="px-6 py-2.5 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 bg-[#1E7D4E] text-white rounded-xl hover:bg-[#0F3D2E] transition-colors font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            حفظ وتفعيل
          </button>
        </div>
      </form>
    </div>
  );
}

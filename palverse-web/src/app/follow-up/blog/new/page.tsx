"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Save, ArrowRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

export default function NewArticlePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title_ar: "",
    title_en: "",
    excerpt_ar: "",
    excerpt_en: "",
    content_ar: "",
    content_en: "",
    cover_image: "",
    is_published: false,
  });

  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setCoverImageFile(file);
      }
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'cover_image') {
            form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : String(value));
        }
      });

      if (coverImageFile) {
        form.append('cover_image', coverImageFile);
      }

      await apiClient.post('/follow-up/articles', form, {
          headers: {
              'Content-Type': 'multipart/form-data'
          }
      });
      toast.success("تم إنشاء المقال بنجاح");
      router.refresh();
      router.push('/follow-up/blog');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "حدث خطأ أثناء حفظ المقال");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link 
          href="/follow-up/blog"
          className="p-2 hover:bg-gray-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">إنشاء مقال جديد</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
            أضف محتوى جديداً لمدونة الموقع لزيادة التفاعل والزيارات.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] p-6 space-y-6">
        
        {/* Toggle Publish */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-gray-100 dark:border-gray-800">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={formData.is_published}
            onChange={handleChange}
            className="w-5 h-5 text-[#1E7D4E] rounded border-gray-300 focus:ring-[#1E7D4E]"
          />
          <label htmlFor="is_published" className="font-bold text-gray-900 dark:text-gray-100 cursor-pointer">
            نشر المقال فوراً (سيكون متاحاً للزوار)
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              عنوان المقال (عربي) *
            </label>
            <input
              type="text"
              name="title_ar"
              required
              value={formData.title_ar}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-[#1E7D4E] outline-none"
              placeholder="مثال: كيف تزيد مبيعاتك في 2026..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              عنوان المقال (إنجليزي)
            </label>
            <input
              type="text"
              name="title_en"
              value={formData.title_en}
              onChange={handleChange}
              dir="ltr"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-[#1E7D4E] outline-none"
              placeholder="How to increase sales..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            صورة الغلاف (اختياري)
          </label>
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              name="cover_image"
              onChange={handleChange}
              className="w-full file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#EAF3EC] file:text-[#1E7D4E] hover:file:bg-[#1E7D4E] hover:file:text-white file:transition-colors py-2 px-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              مقتطف قصير (عربي)
            </label>
            <textarea
              name="excerpt_ar"
              rows={3}
              value={formData.excerpt_ar}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-[#1E7D4E] outline-none resize-none"
              placeholder="ملخص قصير يظهر للزوار قبل الدخول للمقال..."
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              مقتطف قصير (إنجليزي)
            </label>
            <textarea
              name="excerpt_en"
              rows={3}
              dir="ltr"
              value={formData.excerpt_en}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-[#1E7D4E] outline-none resize-none"
              placeholder="Short summary..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            محتوى المقال (عربي) *
          </label>
          <textarea
            name="content_ar"
            required
            rows={10}
            value={formData.content_ar}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-[#1E7D4E] outline-none"
            placeholder="اكتب محتوى المقال هنا..."
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            محتوى المقال (إنجليزي)
          </label>
          <textarea
            name="content_en"
            rows={10}
            dir="ltr"
            value={formData.content_en}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-[#1E7D4E] outline-none"
            placeholder="Write the article content here..."
          />
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
          <Link
            href="/follow-up/blog"
            className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            إلغاء
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-2.5 bg-[#1E7D4E] text-white rounded-xl hover:bg-[#0F3D2E] transition-colors font-bold disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-5 h-5" />
            )}
            حفظ المقال
          </button>
        </div>
      </form>
    </div>
  );
}

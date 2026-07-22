"use client";

import { useEffect, useState } from "react";
import { FileText, Plus, Edit2, Trash2, CheckCircle2, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

export default function FollowUpBlogPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/follow-up/articles');
      setArticles(res.data || []);
    } catch (error) {
      console.error("Failed to load articles:", error);
      toast.error("حدث خطأ أثناء تحميل المقالات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (publicId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذه الخطوة.")) return;
    try {
      await apiClient.delete(`/follow-up/articles/${publicId}`);
      toast.success("تم حذف المقال بنجاح");
      fetchArticles();
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء الحذف");
    }
  };

  const togglePublish = async (article: any) => {
    try {
      await apiClient.put(`/follow-up/articles/${article.public_id}`, {
        is_published: !article.is_published,
      });
      toast.success(article.is_published ? "تم إخفاء المقال" : "تم نشر المقال بنجاح");
      fetchArticles();
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تغيير حالة المقال");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">إدارة المدونة</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إضافة وتعديل مقالات المدونة العامة.
          </p>
        </div>
        <Link
          href="/follow-up/blog/new"
          className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors"
        >
          <Plus className="w-5 h-5" />
          إنشاء مقال جديد
        </Link>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : articles.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252525] border-b border-[#EAF3EC] dark:border-[#1F2522]">
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">العنوان</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">تاريخ الإنشاء</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">المشاهدات</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.public_id} className="border-b border-gray-100 dark:border-[#1F2522] hover:bg-gray-50 dark:hover:bg-[#252525]">
                    <td className="px-4 py-3">
                      <p className="font-medium text-[#0F3D2E] dark:text-[#EAF3EC] max-w-xs truncate" title={article.title_ar}>
                        {article.title_ar}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {new Date(article.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {article.views_count}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {article.is_published ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          منشور
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                          مسودة
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/blog/${article.slug}`}
                          target="_blank"
                          className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors tooltip"
                          title="عرض المقال في الموقع"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => togglePublish(article)}
                          className={`p-1.5 rounded-lg transition-colors tooltip ${
                            article.is_published 
                              ? "bg-orange-50 text-orange-600 hover:bg-orange-100" 
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                          title={article.is_published ? "إلغاء النشر (تحويل لمسودة)" : "نشر المقال"}
                        >
                          {article.is_published ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDelete(article.public_id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors tooltip"
                          title="حذف المقال"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">لا توجد مقالات</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              لم تقم بإنشاء أي مقالات في المدونة حتى الآن. ابدأ بكتابة مقالك الأول!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

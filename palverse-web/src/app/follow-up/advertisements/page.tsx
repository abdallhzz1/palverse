"use client";

import { useEffect, useState } from "react";
import { Megaphone, Plus, Trash2, CheckCircle2, XCircle, Store } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api/client";
import { toast } from "sonner";

export default function FollowUpAdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdvertisements = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/follow-up/advertisements');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">الإعلانات الممولة</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة إعلانات المتاجر المميزة على الصفحة الرئيسية
          </p>
        </div>
        <Link
          href="/follow-up/advertisements/new"
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E7D4E] text-white rounded-xl hover:bg-[#0F3D2E] transition-colors font-bold whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          إضافة إعلان جديد
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : advertisements.length === 0 ? (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-800">
          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">لا توجد إعلانات</h3>
          <p className="text-gray-500 mb-6">لم تقم بإضافة أي إعلانات ممولة بعد</p>
          <Link
            href="/follow-up/advertisements/new"
            className="inline-flex items-center gap-2 px-6 py-2 bg-[#1E7D4E] text-white rounded-xl hover:bg-[#0F3D2E] transition-colors font-bold"
          >
            <Plus className="w-5 h-5" />
            إضافة إعلان جديد
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
                  <th className="text-right py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">المتجر</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">تاريخ البداية</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">تاريخ النهاية</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">المبلغ المدفوع</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">الحالة</th>
                  <th className="text-right py-4 px-6 font-semibold text-gray-600 dark:text-gray-300">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {advertisements.map((ad: any) => (
                  <tr key={ad.public_id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        {ad.ad_type === 'banner' && ad.image_path ? (
                          <div className="w-12 h-10 rounded-lg overflow-hidden relative flex-shrink-0 border border-gray-200">
                            {/* Assuming the backend returns the full URL or just the path. We'll try just the path first since we use full URL for public API but maybe not for admin API yet */}
                            <img src={ad.image_path.startsWith('http') ? ad.image_path : `${process.env.NEXT_PUBLIC_API_BASE_URL?.replace('/api/v1', '')}/storage/${ad.image_path}`} alt="Banner" className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-[#EAF3EC] dark:bg-[#0F3D2E] rounded-lg flex items-center justify-center flex-shrink-0 text-[#1E7D4E] dark:text-[#EAF3EC]">
                            <Store className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            {ad.store?.name_ar || ad.store?.name_en}
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${ad.ad_type === 'banner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                              {ad.ad_type === 'banner' ? 'بنر إعلاني' : 'إبراز المتجر'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {ad.notes || "لا يوجد ملاحظات"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ad.start_date))}
                    </td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      {new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ad.end_date))}
                    </td>
                    <td className="py-4 px-6 font-bold text-[#1E7D4E]">
                      {ad.amount_paid} ₪
                    </td>
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleActive(ad)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          ad.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400'
                        }`}
                      >
                        {ad.is_active ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            نشط
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            متوقف
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDelete(ad.public_id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

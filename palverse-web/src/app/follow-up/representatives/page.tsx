"use client";

import { useEffect, useState } from "react";
import { Users, Phone, Mail, Plus, X, Lock } from "lucide-react";
import Link from "next/link";
import { followUpService } from "@/services/followUp.service";

export default function FollowUpRepresentativesPage() {
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const fetchReps = async () => {
    setIsLoading(true);
    try {
      const res = await followUpService.getRepresentatives(1);
      setRepresentatives(res.data.data || res.data || []);
    } catch (error) {
      console.error("Failed to load representatives:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReps();
  }, []);

  const handleCreateRepresentative = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      await followUpService.createRepresentative(formData);
      setIsModalOpen(false);
      setFormData({ name: "", email: "", phone: "", password: "" });
      fetchReps(); // Refresh the list
    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setFormError(err.data.errors[firstErrorKey][0]);
      } else {
        setFormError(err.message || "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">مندوبو المبيعات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            متابعة أداء ومشاكل مندوبي المبيعات في الميدان.
          </p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#1E7D4E] text-white rounded-xl hover:bg-[#0F3D2E] transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          إضافة مندوب جديد
        </button>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : representatives.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252525] border-b border-[#EAF3EC] dark:border-[#1F2522]">
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">اسم المندوب</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">معلومات التواصل</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">المناطق الجغرافية</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-center">طلبات التسجيل</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 text-center">المكالمات المسجلة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {representatives.map((rep) => (
                  <tr key={rep.public_id} className="border-b border-gray-100 dark:border-[#1F2522] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0F3D2E] dark:text-[#EAF3EC]">
                      {rep.name || `${rep.first_name || ''} ${rep.last_name || ''}`}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1 mb-1">
                        <Phone className="w-3 h-3" />
                        <span dir="ltr">{rep.phone}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        <span>{rep.email}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {rep.representative_zones && rep.representative_zones.length > 0 
                        ? rep.representative_zones.map((z: any) => z.name_ar).join('، ')
                        : 'غير محدد'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 font-bold text-sm">
                        {rep.store_registration_requests_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 font-bold text-sm">
                        {rep.follow_up_calls_count || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/follow-up/calls/new?representative_id=${rep.id}&type=representative_follow_up`}
                        className="text-[#1E7D4E] hover:underline font-medium text-sm"
                      >
                        تسجيل مكالمة متابعة
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-[#252525] rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">لا يوجد مناديب مبيعات</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              لم يتم العثور على مناديب مبيعات مسجلين في النظام.
            </p>
          </div>
        )}
      </div>

      {/* Create Representative Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#171717] w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#1F2522]">
              <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">إضافة مندوب جديد</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateRepresentative} className="p-6 space-y-4">
              {formError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">اسم المندوب الكامل</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">رقم الجوال</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] dir-ltr text-right"
                    placeholder="0590000000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور (مؤقتة)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 bg-[#1E7D4E] text-white rounded-xl hover:bg-[#0F3D2E] transition-colors font-bold disabled:opacity-50"
                >
                  {isSubmitting ? "جاري الإنشاء..." : "إنشاء حساب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

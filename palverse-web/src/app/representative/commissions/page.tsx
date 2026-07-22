"use client";

import { useEffect, useState } from "react";
import { Banknote, Search, Store } from "lucide-react";
import { RepresentativeService } from "@/services/representative.service";
import type { CommissionRecord } from "@/types/representative";

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        const res = await RepresentativeService.getCommissions();
        setCommissions(res.data || []);
      } catch (error) {
        console.error("Failed to load commissions:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommissions();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'payable': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'pending': return 'قيد المراجعة';
      case 'approved': return 'معتمدة';
      case 'payable': return 'جاهزة للدفع';
      case 'paid': return 'مدفوعة';
      case 'cancelled': return 'ملغاة';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">سجل العمولات</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            متابعة العمولات المستحقة والمدفوعة من تسجيل المتاجر وتجديد الاشتراكات.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-[#1F2522] text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">المتجر / الطلب</th>
                  <th className="px-6 py-4 font-medium">سبب العمولة</th>
                  <th className="px-6 py-4 font-medium">المبلغ</th>
                  <th className="px-6 py-4 font-medium">تاريخ الاستحقاق</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF3EC] dark:divide-[#1F2522]">
                {commissions.map((comm) => (
                  <tr key={comm.public_id} className="hover:bg-gray-50 dark:hover:bg-[#1F2522]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#EAF3EC] dark:bg-[#252525] rounded-lg">
                          <Store className="w-5 h-5 text-[#1E7D4E]" />
                        </div>
                        <span className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{comm.request?.store_name_ar || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{comm.reason}</td>
                    <td className="px-6 py-4 font-bold text-green-600 dark:text-green-500">
                      {comm.amount} {comm.currency}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(comm.earned_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(comm.status)}`}>
                        {getStatusLabel(comm.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            لا توجد عمولات مسجلة بعد.
          </div>
        )}
      </div>
    </div>
  );
}

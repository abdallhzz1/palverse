"use client";

import { useEffect, useState } from "react";
import { Store, Search, Filter } from "lucide-react";
import Link from "next/link";
import { followUpService } from "@/services/followUp.service";

export default function FollowUpStoreRequestsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const TABS = [
    { id: 'all', label: 'الجميع' },
    { id: 'submitted', label: 'مقدم' },
    { id: 'under_review', label: 'قيد المراجعة' },
    { id: 'needs_changes', label: 'يحتاج تعديلات' },
    { id: 'approved', label: 'مقبولة' },
    { id: 'rejected', label: 'مرفوضة' },
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const res = await followUpService.getStoreRequests(1, {
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load requests:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRequests();
  }, [statusFilter]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'under_review': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'needs_changes': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'draft': return 'مسودة';
      case 'submitted': return 'مقدم';
      case 'under_review': return 'قيد المراجعة';
      case 'approved': return 'معتمد';
      case 'rejected': return 'مرفوض';
      case 'needs_changes': return 'يحتاج تعديلات';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">طلبات تسجيل المتاجر</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            مراجعة ومتابعة طلبات تسجيل المتاجر الواردة من المناديب.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        <div className="p-4 border-b border-[#EAF3EC] dark:border-[#1F2522] flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  statusFilter === tab.id
                    ? "bg-[#1E7D4E] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-[#252525] dark:text-gray-400 dark:hover:bg-[#333]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252525] border-b border-[#EAF3EC] dark:border-[#1F2522]">
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">اسم المتجر</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">اسم التاجر</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">رقم الهاتف</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">المندوب</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الحالة</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">تاريخ الطلب</th>
                  <th className="px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req.public_id} className="border-b border-gray-100 dark:border-[#1F2522] hover:bg-gray-50 dark:hover:bg-[#252525] transition-colors">
                    <td className="px-4 py-3 font-medium text-[#0F3D2E] dark:text-[#EAF3EC]">{req.store_name_ar}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{req.proposed_merchant_name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400" dir="ltr">{req.phone}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {req.representative?.name ||
                        [req.representative?.first_name, req.representative?.last_name]
                          .filter(Boolean)
                          .join(" ") ||
                        "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-sm">
                      {new Date(req.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-4 py-3">
                      <Link 
                        href={`/follow-up/store-requests/${req.public_id}`}
                        className="text-[#1E7D4E] hover:underline font-medium text-sm"
                      >
                        عرض ومراجعة
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
              <Store className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-[#0F3D2E] dark:text-[#EAF3EC] mb-1">لا توجد طلبات</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              لم يتم العثور على طلبات تسجيل بهذا التصنيف حالياً.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

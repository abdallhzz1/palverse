"use client";

import { useEffect, useState } from "react";
import { Store, Plus, Search } from "lucide-react";
import Link from "next/link";
import { RepresentativeService } from "@/services/representative.service";
import type { StoreRegistrationRequest } from "@/types/representative";

export default function StoreRequestsPage() {
  const [requests, setRequests] = useState<StoreRegistrationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const TABS = [
    { id: 'all', label: 'الجميع' },
    { id: 'needs_changes', label: 'بانتظار التعديل' },
    { id: 'under_review', label: 'قيد المراجعة' },
    { id: 'approved', label: 'مقبولة' },
    { id: 'rejected', label: 'مرفوضة' },
  ];

  useEffect(() => {
    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        const res = await RepresentativeService.getStoreRequests(1, statusFilter);
        setRequests(res.data);
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">طلبات تسجيل المتاجر</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            إدارة ومتابعة طلبات المتاجر التي قمت بتسجيلها.
          </p>
        </div>
        <Link
          href="/representative/store-requests/new"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors"
        >
          <Plus className="w-5 h-5" />
          تسجيل متجر جديد
        </Link>
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
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="ابحث عن متجر..." 
              className="w-full pl-4 pr-10 py-2 bg-gray-50 dark:bg-[#252525] border-none rounded-lg focus:ring-2 focus:ring-[#1E7D4E]"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-[#1F2522] text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">اسم المتجر</th>
                  <th className="px-6 py-4 font-medium">التاجر المقترح</th>
                  <th className="px-6 py-4 font-medium">رقم التواصل</th>
                  <th className="px-6 py-4 font-medium">المنطقة</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium">تاريخ الطلب</th>
                  <th className="px-6 py-4 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF3EC] dark:divide-[#1F2522]">
                {requests.map((request) => (
                  <tr key={request.public_id} className="hover:bg-gray-50 dark:hover:bg-[#1F2522]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#EAF3EC] dark:bg-[#252525] rounded-lg">
                          <Store className="w-5 h-5 text-[#1E7D4E]" />
                        </div>
                        <span className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{request.store_name_ar}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{request.proposed_merchant_name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{request.proposed_merchant_phone}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{request.zone?.name_ar}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)}`}>
                        {request.status_label_ar}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(request.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <Link 
                        href={`/representative/store-requests/${request.public_id}`}
                        className="text-[#1E7D4E] hover:underline font-medium text-sm"
                      >
                        التفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            لا توجد طلبات مسجلة بعد.
          </div>
        )}
      </div>
    </div>
  );
}

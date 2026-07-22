"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Search, Store } from "lucide-react";
import { followUpService } from "@/services/followUp.service";
import type { CollectionReceipt } from "@/types/representative";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<CollectionReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const fetchReceipts = async () => {
    try {
      const res = await followUpService.getReceipts();
      setReceipts(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Failed to load receipts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleSettle = async (publicId: string) => {
    if (!confirm("هل أنت متأكد من استلامك لهذا المبلغ وتأكيد توريده للشركة؟")) return;
    
    setSettlingId(publicId);
    try {
      await followUpService.settleReceipt(publicId);
      await fetchReceipts();
    } catch (error) {
      console.error("Failed to settle receipt:", error);
      alert("حدث خطأ أثناء تأكيد التوريد.");
    } finally {
      setSettlingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'issued': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'settled': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'issued': return 'مُصدر (قيد التوريد)';
      case 'settled': return 'تم التوريد';
      case 'cancelled': return 'ملغى';
      default: return status;
    }
  };

  const getPaymentPurposeLabel = (purpose: string) => {
    switch(purpose) {
      case 'subscription': return 'اشتراك متجر';
      case 'registration_fee': return 'رسوم تسجيل';
      case 'other': return 'أخرى';
      default: return purpose;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">سندات القبض</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            مراجعة المبالغ المحصلة من قبل المناديب وتأكيد استلامها وتوريدها للشركة.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : receipts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-[#1F2522] text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">رقم السند</th>
                  <th className="px-6 py-4 font-medium">المتجر / الطلب</th>
                  <th className="px-6 py-4 font-medium">غرض الدفع</th>
                  <th className="px-6 py-4 font-medium">المبلغ المحصل</th>
                  <th className="px-6 py-4 font-medium">تاريخ التحصيل</th>
                  <th className="px-6 py-4 font-medium">الحالة</th>
                  <th className="px-6 py-4 font-medium text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF3EC] dark:divide-[#1F2522]">
                {receipts.map((receipt) => (
                  <tr key={receipt.public_id} className="hover:bg-gray-50 dark:hover:bg-[#1F2522]/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-sm">{receipt.receipt_number}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">
                          {receipt.store?.name_ar || receipt.request?.store_name_ar || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {getPaymentPurposeLabel(receipt.payment_purpose)}
                    </td>
                    <td className="px-6 py-4 font-bold text-purple-600 dark:text-purple-500">
                      {receipt.amount} {receipt.currency}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(receipt.collected_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(receipt.status)}`}>
                        {getStatusLabel(receipt.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {receipt.status === 'issued' && (
                        <button
                          onClick={() => handleSettle(receipt.public_id)}
                          disabled={settlingId === receipt.public_id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1E7D4E] text-white rounded-lg text-sm font-medium hover:bg-[#0F3D2E] transition-colors disabled:opacity-50"
                        >
                          {settlingId === receipt.public_id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          تأكيد التوريد
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            لا توجد سندات قبض مسجلة.
          </div>
        )}
      </div>
    </div>
  );
}

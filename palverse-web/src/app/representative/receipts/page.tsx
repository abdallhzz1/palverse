"use client";

import { useEffect, useState } from "react";
import { CreditCard, Search, Store } from "lucide-react";
import Link from "next/link";
import { RepresentativeService } from "@/services/representative.service";
import type { CollectionReceipt } from "@/types/representative";

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<CollectionReceipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReceipts = async () => {
      try {
        const res = await RepresentativeService.getReceipts();
        setReceipts(res.data || []);
      } catch (error) {
        console.error("Failed to load receipts:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReceipts();
  }, []);

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
      case 'issued': return 'مُصدر (غير مورد)';
      case 'settled': return 'مُورد';
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
            متابعة المبالغ النقدية المحصلة من المتاجر وتوريدها للشركة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/representative/receipts/new"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors"
          >
            <CreditCard className="w-5 h-5" />
            إصدار سند قبض جديد
          </Link>
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

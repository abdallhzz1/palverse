"use client";

import { useEffect, useState } from "react";
import { FileX } from "lucide-react";
import Link from "next/link";
import { RepresentativeService } from "@/services/representative.service";
import type { RejectionReport } from "@/types/representative";

export default function RejectionReportsPage() {
  const [reports, setReports] = useState<RejectionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await RepresentativeService.getRejectionReports();
        setReports(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to load rejection reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">تقارير الرفض (الزيارات غير الناجحة)</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            توثيق زيارات المتاجر التي لم تبدِ اهتماماً أو رفضت الاشتراك حالياً.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/representative/rejection-reports/new"
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1E7D4E] text-white rounded-lg font-bold hover:bg-[#0F3D2E] transition-colors"
          >
            <FileX className="w-5 h-5" />
            إضافة تقرير رفض جديد
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-[#171717] rounded-2xl border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-[#1E7D4E] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 dark:bg-[#1F2522] text-gray-500 dark:text-gray-400 text-sm">
                <tr>
                  <th className="px-6 py-4 font-medium">اسم النشاط</th>
                  <th className="px-6 py-4 font-medium">المنطقة</th>
                  <th className="px-6 py-4 font-medium">سبب الرفض</th>
                  <th className="px-6 py-4 font-medium">ملاحظات عامة عن الزيارة</th>
                  <th className="px-6 py-4 font-medium">مطلوب متابعة</th>
                  <th className="px-6 py-4 font-medium">تاريخ الزيارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAF3EC] dark:divide-[#1F2522]">
                {reports.map((report) => (
                  <tr key={report.public_id} className="hover:bg-gray-50 dark:hover:bg-[#1F2522]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 dark:bg-[#252525] rounded-lg">
                          <FileX className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <span className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC] block">{report.business_name}</span>
                          {report.owner_name && <span className="text-xs text-gray-500">{report.owner_name}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{report.zone?.name_ar || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      <span className="font-medium">{report.refusal_reason_label_ar}</span>
                      {report.refusal_reason_text && <p className="text-xs text-gray-500 mt-1">{report.refusal_reason_text}</p>}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 max-w-xs">
                      {report.notes ? (
                        <p className="text-sm whitespace-pre-wrap">{report.notes}</p>
                      ) : (
                        <span className="text-gray-400 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {report.follow_up_required ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded text-xs font-bold">
                          نعم
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">لا</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(report.contacted_at).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            لا توجد تقارير رفض مسجلة.
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useCommissionsList } from "@/hooks/use-commissions";
import { Pagination } from "@/components/ui/pagination";
import { Banknote, AlertCircle, CheckCircle } from "lucide-react";
import { commissionsService } from "@/services/commissions.service";
import { CommissionSettingsForm } from "@/components/commissions/commission-settings-form";

export default function CommissionsPage() {
  const { data, isLoading, error, params, setFilter, refresh } = useCommissionsList();

  const handlePay = async (id: string) => {
    if (!confirm("هل أنت متأكد من صرف هذه العمولة؟")) return;
    try {
      await commissionsService.markAsPaid(id);
      refresh();
      alert("تم صرف العمولة بنجاح");
    } catch (err) {
      alert("حدث خطأ أثناء صرف العمولة");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">العمولات</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">إدارة إعدادات العمولة، ومراجعة عمولات المناديب وصرفها</p>
        </div>
      </div>

      <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm p-6">
        <CommissionSettingsForm />
      </div>

      <div className="bg-card dark:bg-slate-900 border border-border dark:border-slate-800 rounded-lg shadow-sm">
        <div className="p-4 border-b border-border dark:border-slate-800">
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <select
              className="h-10 px-3 py-2 rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={params.status || ""}
              onChange={(e) => setFilter("status", e.target.value)}
            >
              <option value="">جميع الحالات</option>
              <option value="pending">معلقة</option>
              <option value="paid">مصروفة</option>
              <option value="cancelled">ملغاة</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground bg-muted dark:bg-slate-800/50 uppercase border-b border-border dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">المندوب</th>
                <th className="px-6 py-4 font-medium">المتجر / العملية</th>
                <th className="px-6 py-4 font-medium">قيمة العمولة</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">تاريخ الاستحقاق</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p>حدث خطأ أثناء جلب البيانات</p>
                    <button onClick={refresh} className="mt-2 text-emerald-600 hover:underline">إعادة المحاولة</button>
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Banknote className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد عمولات مطابقة</p>
                  </td>
                </tr>
              ) : (
                data?.data.map((commission) => (
                  <tr key={commission.public_id} className="hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground dark:text-white">
                        {commission.representative?.name || "---"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{commission.store?.name_ar || "---"}</div>
                      <div className="text-xs text-muted-foreground">{commission.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-600 dark:text-emerald-400">₪{commission.amount}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        commission.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' :
                        commission.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                      }`}>
                        {commission.status === 'paid' ? 'مصروفة' : commission.status === 'pending' ? 'معلقة' : 'ملغاة'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span dir="ltr" className="text-muted-foreground">{new Date(commission.created_at).toLocaleDateString('en-GB')}</span>
                    </td>
                    <td className="px-6 py-4">
                      {commission.status === 'pending' && (
                        <button 
                          onClick={() => handlePay(commission.public_id)}
                          className="inline-flex items-center justify-center gap-1 h-8 px-3 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          تأكيد الصرف
                        </button>
                      )}
                      {commission.status === 'paid' && commission.paid_at && (
                        <span className="text-xs text-muted-foreground">
                          صرفت في {new Date(commission.paid_at).toLocaleDateString('en-GB')}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && data?.meta && (
          <div className="p-4 border-t border-border dark:border-slate-800">
            <Pagination 
              currentPage={data.meta.current_page}
              totalPages={data.meta.last_page}
              onPageChange={(page) => setFilter("page", page)} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

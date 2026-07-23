"use client";

import { useState } from "react";
import { useJoinRequestsList } from "@/hooks/use-join-requests";
import { useSubscriptionPlansList } from "@/hooks/use-subscription-plans";
import { Pagination } from "@/components/ui/pagination";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AlertCircle, UserPlus, PhoneCall, Check, X, CheckCircle2, Lock, CreditCard, Eye, EyeOff, Mail } from "lucide-react";
import { joinRequestsService } from "@/services/join-requests.service";
import { normalizeApiError } from "@/lib/api/error";
import { formatDate } from "@/lib/utils/formatters";
import { toast } from "sonner";

interface JoinRequest {
  public_id: string;
  merchant_name: string;
  store_name: string;
  phone: string;
  email: string | null;
  status: string;
  status_label?: string;
  city: { public_id?: string; id?: number; name_ar: string } | null;
  created_at: string;
  notes?: string;
}

export default function JoinRequestsPage() {
  const { data, isLoading, error, params, setFilter, refresh } = useJoinRequestsList();
  const { data: plansData } = useSubscriptionPlansList({ page: 1, per_page: 100 }, false);
  const plans = plansData?.data ?? [];

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [approveForm, setApproveForm] = useState({
    email: "",
    password: "",
    subscription_plan_id: "",
  });

  const [statusChange, setStatusChange] = useState<{ publicId: string; newStatus: string } | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const confirmStatusChange = async () => {
    if (!statusChange) return;
    setIsUpdatingStatus(true);
    try {
      await joinRequestsService.updateStatus(statusChange.publicId, { status: statusChange.newStatus });
      toast.success("تم تحديث حالة الطلب بنجاح");
      setStatusChange(null);
      refresh();
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحديث الحالة");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleOpenApproveModal = (req: {
    public_id: string;
    merchant_name: string;
    store_name: string;
    phone: string;
    email?: string | null;
    status: string;
    status_label?: string;
    city: JoinRequest["city"];
    created_at: string;
    notes?: string;
  }) => {
    setSelectedRequest({
      public_id: req.public_id,
      merchant_name: req.merchant_name,
      store_name: req.store_name,
      phone: req.phone,
      email: req.email ?? null,
      status: req.status,
      status_label: req.status_label,
      city: req.city,
      created_at: req.created_at,
      notes: req.notes,
    });
    setApproveForm({
      email: req.email ?? "",
      password: "",
      subscription_plan_id: "",
    });
    setApproveError(null);
    setShowPassword(false);
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (!selectedRequest.email && !approveForm.email.trim()) {
      setApproveError("البريد الإلكتروني مطلوب لإنشاء حساب التاجر.");
      return;
    }
    
    setIsApproving(true);
    setApproveError(null);

    try {
      await joinRequestsService.updateStatus(selectedRequest.public_id, {
        status: 'approved',
        email: approveForm.email.trim() || undefined,
        password: approveForm.password,
        subscription_plan_id: approveForm.subscription_plan_id,
      });
      setIsApproveModalOpen(false);
      refresh();
    } catch (err) {
      const normalized = normalizeApiError(err);
      const firstFieldError = normalized.details
        ? Object.values(normalized.details)[0]?.[0]
        : undefined;
      setApproveError(firstFieldError || normalized.message || "حدث خطأ غير متوقع.");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white">طلبات الانضمام (من الموقع)</h2>
          <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
            استعراض طلبات الانضمام المباشرة والموافقة عليها.
          </p>
        </div>
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
              <option value="new">جديد</option>
              <option value="contacted">تم التواصل</option>
              <option value="approved">تم الموافقة / التحويل</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="text-xs text-muted-foreground bg-muted dark:bg-slate-800/50 uppercase border-b border-border dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">صاحب المحل واسم المحل</th>
                <th className="px-6 py-4 font-medium">معلومات التواصل</th>
                <th className="px-6 py-4 font-medium">المدينة</th>
                <th className="px-6 py-4 font-medium">الحالة</th>
                <th className="px-6 py-4 font-medium">تاريخ الطلب</th>
                <th className="px-6 py-4 font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div><div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded"></div></td>
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
                    <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>لا توجد طلبات انضمام</p>
                  </td>
                </tr>
              ) : (
                data?.data.map((req) => (
                  <tr key={req.public_id} className="hover:bg-muted/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground dark:text-white">{req.store_name}</div>
                      <div className="text-sm text-muted-foreground">{req.merchant_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-left" dir="ltr">{req.phone}</div>
                      <div className="text-xs text-muted-foreground text-left" dir="ltr">{req.email || "---"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{req.city?.name_ar || "---"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        req.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-400' :
                        req.status === 'contacted' ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-400' :
                        req.status === 'approved' ? 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400' :
                        'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400'
                      }`}>
                        {req.status === 'new' ? 'جديد' : 
                         req.status === 'contacted' ? 'تم التواصل' : 
                         req.status === 'approved' ? 'تم الموافقة / التحويل' : 'مرفوض'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span dir="ltr" className="text-muted-foreground text-xs">{formatDate(req.created_at)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {req.status === 'new' && (
                          <button 
                            onClick={() => setStatusChange({ publicId: req.public_id, newStatus: 'contacted' })}
                            className="p-1.5 text-amber-600 bg-amber-50 dark:bg-amber-500/10 rounded hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors tooltip"
                            title="تغيير الحالة إلى تم التواصل"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </button>
                        )}
                        {(req.status === 'new' || req.status === 'contacted') && (
                          <>
                            <button 
                              onClick={() => handleOpenApproveModal(req)}
                              className="p-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 rounded hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors tooltip"
                              title="الموافقة (وإنشاء الحساب والاشتراك)"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setStatusChange({ publicId: req.public_id, newStatus: 'rejected' })}
                              className="p-1.5 text-red-600 bg-red-50 dark:bg-red-500/10 rounded hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors tooltip"
                              title="رفض الطلب"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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

      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-border dark:border-slate-800">
            <div className="flex items-center justify-between p-4 border-b border-border dark:border-slate-800">
              <h3 className="text-xl font-bold text-foreground dark:text-white">الموافقة وإنشاء حساب</h3>
              <button 
                onClick={() => setIsApproveModalOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleApproveSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm mb-4">
                الموافقة على طلب التاجر <strong>{selectedRequest.merchant_name}</strong> ستؤدي إلى إنشاء حساب تاجر، ومحل باسم <strong>{selectedRequest.store_name}</strong> واشتراك جديد بشكل آلي.
              </div>

              {approveError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm font-semibold border border-red-100 dark:border-red-900/30">
                  {approveError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">
                  البريد الإلكتروني للتاجر {!selectedRequest.email ? "*" : "(اختياري للتعديل)"}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type="email"
                    required={!selectedRequest.email}
                    value={approveForm.email}
                    onChange={(e) => setApproveForm({ ...approveForm, email: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary dir-ltr text-right"
                    placeholder={selectedRequest.email ? "يمكن تركه كما هو أو تعديله" : "مطلوب لأن الطلب بلا بريد"}
                  />
                </div>
                {!selectedRequest.email && (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">
                    الطلب بلا بريد — أدخل بريداً لتسجيل دخول التاجر.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">كلمة المرور للتاجر *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={approveForm.password}
                    onChange={(e) => setApproveForm({ ...approveForm, password: e.target.value })}
                    className="block w-full pr-10 pl-10 py-2.5 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary dir-ltr text-right"
                    placeholder="أدخل كلمة مرور أولية للتاجر"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-muted-foreground hover:text-emerald-600 focus:outline-none"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground dark:text-gray-300 mb-2">باقة الاشتراك *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <select
                    required
                    value={approveForm.subscription_plan_id}
                    onChange={(e) => setApproveForm({ ...approveForm, subscription_plan_id: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">اختر الباقة المتفق عليها</option>
                    {plans.map((plan) => (
                      <option key={plan.public_id} value={plan.public_id}>
                        {plan.name_ar} - {Number(plan.price) > 0 ? `${plan.price} شيقل / ${plan.duration_days} يوم` : 'مجانية'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isApproving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-bold disabled:opacity-50"
                >
                  {isApproving ? "جاري الإنشاء..." : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      موافقة وإنشاء حساب
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={statusChange !== null}
        onClose={() => setStatusChange(null)}
        onConfirm={confirmStatusChange}
        title={statusChange?.newStatus === "rejected" ? "رفض الطلب" : "تغيير حالة الطلب"}
        description={
          statusChange?.newStatus === "rejected"
            ? "هل أنت متأكد من رفض هذا الطلب؟"
            : "هل أنت متأكد من تغيير حالة الطلب إلى \"تم التواصل\"؟"
        }
        variant={statusChange?.newStatus === "rejected" ? "danger" : "primary"}
        confirmText="تأكيد"
        isLoading={isUpdatingStatus}
      />
    </div>
  );
}

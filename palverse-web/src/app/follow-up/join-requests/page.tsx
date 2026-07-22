"use client";

import { useState, useEffect } from "react";
import { Store, User, Phone, Mail, MapPin, CheckCircle2, Search, Filter, PhoneCall, Check, X, Lock, CreditCard } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface JoinRequest {
  public_id: string;
  merchant_name: string;
  store_name: string;
  phone: string;
  email: string | null;
  status: 'new' | 'contacted' | 'approved' | 'rejected';
  status_label: string;
  city: { id: number; name_ar: string } | null;
  created_at: string;
  handler: { id: number; name: string } | null;
  notes?: string;
}

interface SubscriptionPlan {
  public_id: string;
  name_ar: string;
  price: number;
  duration_days: number;
}

export default function FollowUpJoinRequestsPage() {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // Approve Modal State
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approveForm, setApproveForm] = useState({
    password: "",
    subscription_plan_id: "",
  });

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const query = filter !== 'all' ? `?status=${filter}` : '';
      const res = await apiClient.get(`/follow-up/merchant-join-requests${query}`);
      setRequests(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await apiClient.get(`/subscription-plans`);
      setPlans(res.data || []);
    } catch (error) {
      console.error("Failed to load plans", error);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchPlans();
  }, [filter]);

  const updateStatus = async (publicId: string, newStatus: string) => {
    try {
      await apiClient.put(`/follow-up/merchant-join-requests/${publicId}/status`, { status: newStatus });
      fetchRequests();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("حدث خطأ أثناء تحديث الحالة");
    }
  };

  const handleOpenApproveModal = (req: JoinRequest) => {
    setSelectedRequest(req);
    setApproveForm({ password: "", subscription_plan_id: "" });
    setApproveError(null);
    setIsApproveModalOpen(true);
  };

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    setIsApproving(true);
    setApproveError(null);

    try {
      await apiClient.put(`/follow-up/merchant-join-requests/${selectedRequest.public_id}/status`, {
        status: 'approved',
        password: approveForm.password,
        subscription_plan_id: approveForm.subscription_plan_id,
      });
      setIsApproveModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      if (err.data?.errors) {
        const firstErrorKey = Object.keys(err.data.errors)[0];
        setApproveError(err.data.errors[firstErrorKey][0]);
      } else {
        setApproveError(err.message || "حدث خطأ غير متوقع.");
      }
    } finally {
      setIsApproving(false);
    }
  };

  const getStatusBadge = (status: string, label: string) => {
    switch (status) {
      case 'new':
        return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">{label}</span>;
      case 'contacted':
        return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-yellow-900 dark:text-yellow-300">{label}</span>;
      case 'approved':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">{label}</span>;
      case 'rejected':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-red-900 dark:text-red-300">{label}</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full dark:bg-gray-700 dark:text-gray-300">{label}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">طلبات الانضمام</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            إدارة ومتابعة طلبات التسجيل الواردة من الموقع العام
          </p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 dark:border-[#1F2522] rounded-xl px-4 py-2 bg-white dark:bg-[#171717] focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
          >
            <option value="all">جميع الطلبات</option>
            <option value="new">جديد</option>
            <option value="contacted">تم التواصل</option>
            <option value="approved">تم الموافقة</option>
            <option value="rejected">مرفوض</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#171717] rounded-2xl shadow-sm border border-[#EAF3EC] dark:border-[#1F2522] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-[#1F2522] dark:text-gray-300 border-b border-[#EAF3EC] dark:border-[#0F3D2E]">
              <tr>
                <th scope="col" className="px-6 py-4">التاجر / المحل</th>
                <th scope="col" className="px-6 py-4">التواصل</th>
                <th scope="col" className="px-6 py-4">المدينة</th>
                <th scope="col" className="px-6 py-4">تاريخ الطلب</th>
                <th scope="col" className="px-6 py-4">الحالة</th>
                <th scope="col" className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    جاري تحميل الطلبات...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    لا توجد طلبات لعرضها.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.public_id} className="bg-white border-b dark:bg-[#171717] dark:border-[#1F2522] hover:bg-gray-50 dark:hover:bg-[#1F2522]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">{req.merchant_name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Store className="w-3 h-3" /> {req.store_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 dir-ltr text-right">
                      <div className="text-[#1E7D4E] font-medium">{req.phone}</div>
                      {req.email && <div className="text-xs text-gray-500 mt-1">{req.email}</div>}
                    </td>
                    <td className="px-6 py-4">
                      {req.city?.name_ar || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {new Date(req.created_at).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(req.status, req.status_label)}
                      {req.handler && (
                        <div className="text-[10px] text-gray-400 mt-1">بواسطة: {req.handler.name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {req.status === 'new' && (
                          <button 
                            onClick={() => updateStatus(req.public_id, 'contacted')}
                            className="p-2 text-yellow-600 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors tooltip"
                            title="تغيير الحالة إلى تم التواصل"
                          >
                            <PhoneCall className="w-4 h-4" />
                          </button>
                        )}
                        {(req.status === 'new' || req.status === 'contacted') && (
                          <>
                            <button 
                              onClick={() => handleOpenApproveModal(req)}
                              className="p-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors tooltip"
                              title="الموافقة (وإنشاء الحساب والاشتراك)"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => updateStatus(req.public_id, 'rejected')}
                              className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors tooltip"
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
      </div>

      {/* Approve & Create Account Modal */}
      {isApproveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-[#171717] w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-[#1F2522]">
              <h3 className="text-xl font-bold text-[#0F3D2E] dark:text-[#EAF3EC]">الموافقة وإنشاء حساب</h3>
              <button 
                onClick={() => setIsApproveModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleApproveSubmit} className="p-6 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm mb-4">
                الموافقة على طلب التاجر <strong>{selectedRequest.merchant_name}</strong> ستؤدي إلى إنشاء حساب تاجر، ومتجر باسم <strong>{selectedRequest.store_name}</strong> واشتراك جديد بشكل آلي.
              </div>

              {approveError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-semibold border border-red-100">
                  {approveError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">كلمة المرور للتاجر *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    minLength={8}
                    value={approveForm.password}
                    onChange={(e) => setApproveForm({ ...approveForm, password: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E] dir-ltr text-right"
                    placeholder="أدخل كلمة مرور أولية للتاجر"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">باقة الاشتراك *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    required
                    value={approveForm.subscription_plan_id}
                    onChange={(e) => setApproveForm({ ...approveForm, subscription_plan_id: e.target.value })}
                    className="block w-full pr-10 pl-3 py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
                  >
                    <option value="">اختر الباقة المتفق عليها</option>
                    {plans.map((plan) => (
                      <option key={plan.public_id} value={plan.public_id}>
                        {plan.name_ar} - {plan.price > 0 ? `${plan.price} شيقل / ${plan.duration_days} يوم` : 'مجانية'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isApproving}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1E7D4E] text-white rounded-xl hover:bg-[#0F3D2E] transition-colors font-bold disabled:opacity-50"
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
    </div>
  );
}

"use client";

import { usePublicAuth } from "@/contexts/AuthContext";
import { User, Mail, Phone, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
  const { user } = usePublicAuth();

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#0F3D2E] mb-2">
          أهلاً بك، {user.name.split(' ')[0]} ✨
        </h1>
        <p className="text-[#7FA789]">
          إليك تفاصيل حسابك الشخصي وحالة التوثيق في المنصة.
        </p>
      </div>

      {/* Verification Alert */}
      {!user.email_verified_at && (
        <div className="bg-[#FFFDF5] border border-yellow-100 rounded-3xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100/50 rounded-2xl text-yellow-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-yellow-800 text-lg">حسابك غير موثق بعد</p>
              <p className="text-sm text-yellow-700 mt-1">يرجى تأكيد بريدك الإلكتروني لضمان أمان حسابك.</p>
            </div>
          </div>
          <Link 
            href="/verify-email" 
            className="w-full sm:w-auto px-6 py-3 bg-white border border-yellow-200 text-yellow-700 hover:bg-yellow-50 rounded-2xl font-bold text-sm whitespace-nowrap transition-colors text-center shadow-sm"
          >
            توثيق الحساب
          </Link>
        </div>
      )}

      {/* Info Card (Settings Style) */}
      <div className="bg-white border border-gray-100 rounded-[2rem] shadow-sm overflow-hidden">
        <div className="p-6 bg-gray-50/50 border-b border-gray-100">
          <h2 className="font-bold text-[#0F3D2E] flex items-center gap-2">
            <User className="w-5 h-5 text-[#1E7D4E]" />
            المعلومات الأساسية
          </h2>
        </div>

        <div className="flex flex-col divide-y divide-gray-50">
          
          {/* Name Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-2 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">الاسم الكامل</span>
            </div>
            <span className="font-bold text-[#0F3D2E] sm:text-left text-lg">{user.name}</span>
          </div>

          {/* Email Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-2 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">البريد الإلكتروني</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0F3D2E] text-lg" dir="ltr">{user.email}</span>
              {user.email_verified_at ? (
                <div title="موثق" className="bg-green-100/50 p-1 rounded-full text-green-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              ) : null}
            </div>
          </div>

          {/* Phone Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-2 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">رقم الهاتف</span>
            </div>
            <span className="font-bold text-[#0F3D2E] sm:text-left text-lg" dir="ltr">
              {user.phone || "غير متوفر"}
            </span>
          </div>

          {/* Date Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-2 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="font-medium text-sm">تاريخ الانضمام</span>
            </div>
            <span className="font-bold text-[#0F3D2E] sm:text-left">
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString("ar-SA", { year: 'numeric', month: 'long', day: 'numeric' })
                : "غير متوفر"}
            </span>
          </div>

        </div>
      </div>
      
    </div>
  );
}

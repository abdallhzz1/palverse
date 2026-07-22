"use client";

import { use } from "react";
import Link from "next/link";
import { useUserDetail, useUserStores, useUserSubscriptions } from "@/hooks/use-user-detail";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { UserRoleBadge } from "@/components/users/user-role-badge";
import { UserActions } from "@/components/users/user-actions";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { ArrowRight, UserCircle, Store, CreditCard, Mail, Phone, Clock, AlertTriangle, Edit, ChevronLeft } from "lucide-react";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";

export default function UserDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params);
  const { user, isLoading, error, refresh } = useUserDetail(resolvedParams.publicId);
  const { data: storesData, isLoading: storesLoading } = useUserStores(resolvedParams.publicId);
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = useUserSubscriptions(resolvedParams.publicId);

  if (isLoading && !user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          </div>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-card dark:bg-[#1F2522] rounded-xl border border-red-100 dark:border-red-900/30 p-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mb-4 opacity-80" />
        <h3 className="text-xl font-bold text-foreground dark:text-white mb-2">
          {error?.status === 404 ? "لم يتم العثور على المستخدم" : "حدث خطأ"}
        </h3>
        <p className="text-muted-foreground mb-6">{error?.message || "تعذر تحميل بيانات المستخدم."}</p>
        <Link href="/users">
          <Button variant="outline">العودة إلى المستخدمين</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border dark:border-slate-800 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground dark:hover:text-white">
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xl uppercase">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground dark:text-white flex items-center gap-2">
                {user.name}
                <UserStatusBadge status={user.status} />
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {user.roles.map(r => <UserRoleBadge key={r} role={r} />)}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/users/${user.public_id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              تعديل البيانات
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground dark:text-white mb-6 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-[#1E7D4E]" />
              البيانات الأساسية
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Mail className="w-4 h-4" />البريد الإلكتروني</p>
                <p className="font-medium text-foreground dark:text-white" dir="ltr">{user.email}</p>
                {user.email_verified_at ? (
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">تم التحقق</span>
                ) : (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded mt-1 inline-block">بانتظار التحقق</span>
                )}
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Phone className="w-4 h-4" />رقم الهاتف</p>
                <p className="font-medium text-foreground dark:text-white" dir="ltr">{user.phone}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">اللغة المفضلة</p>
                <p className="font-medium text-foreground dark:text-white">{user.preferred_locale === "ar" ? "العربية" : "English"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Clock className="w-4 h-4" />تاريخ الانضمام</p>
                <p className="font-medium text-foreground dark:text-white" dir="ltr">{formatDateTime(user.created_at)}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2"><Clock className="w-4 h-4" />آخر تسجيل دخول</p>
                <p className="font-medium text-foreground dark:text-white" dir="ltr">{user.last_login_at ? formatDateTime(user.last_login_at) : "لم يسجل الدخول"}</p>
              </div>
            </div>

            {user.status === "suspended" && user.suspension_reason && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-lg">
                <p className="text-sm font-semibold text-red-800 dark:text-red-400 mb-1">سبب الإيقاف:</p>
                <p className="text-red-700 dark:text-red-300">{user.suspension_reason}</p>
                {user.suspended_by && (
                  <p className="text-xs text-red-500 mt-2">بواسطة: {user.suspended_by.name} ({formatDateTime(user.suspended_at || "")})</p>
                )}
              </div>
            )}
          </div>

          {/* Administrative Actions */}
          <UserActions user={user} onSuccess={refresh} />
        </div>

        {/* Right Column: Merchant / Stats Overview */}
        <div className="space-y-6">
          {/* Linked Stores */}
          <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground dark:text-white mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-[#1E7D4E]" />
              المحلات المرتبطة
            </h3>

            {storesLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !storesData || storesData.data.length === 0 ? (
              <div className="p-4 bg-muted dark:bg-slate-800/50 rounded-lg text-center text-sm text-muted-foreground">
                لا توجد محلات مرتبطة بهذا المستخدم.
              </div>
            ) : (
              <ul className="space-y-2">
                {storesData.data.map((store) => (
                  <li key={store.public_id}>
                    <Link
                      href={`/stores/${store.public_id}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border dark:border-slate-800 hover:bg-muted dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground dark:text-white truncate">{store.name_ar}</p>
                        {typeof store.name_en === "string" && store.name_en && (
                          <p className="text-xs text-muted-foreground truncate" dir="ltr">{store.name_en}</p>
                        )}
                      </div>
                      <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Linked Subscriptions */}
          <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-foreground dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1E7D4E]" />
              الاشتراكات
            </h3>

            {subscriptionsLoading ? (
              <div className="space-y-2">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : !subscriptionsData || subscriptionsData.data.length === 0 ? (
              <div className="p-4 bg-muted dark:bg-slate-800/50 rounded-lg text-center text-sm text-muted-foreground">
                لا توجد اشتراكات مرتبطة بهذا المستخدم.
              </div>
            ) : (
              <ul className="space-y-2">
                {subscriptionsData.data.map((sub) => {
                  const startsAt = typeof sub.starts_at === "string" ? sub.starts_at : null;
                  const endsAt = typeof sub.ends_at === "string" ? sub.ends_at : null;
                  return (
                    <li key={sub.public_id}>
                      <Link
                        href={`/subscriptions/${sub.public_id}`}
                        className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border dark:border-slate-800 hover:bg-muted dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <span className="inline-block text-xs font-medium px-2 py-0.5 rounded-full bg-muted dark:bg-slate-800 text-muted-foreground mb-1">
                            {String(sub.status)}
                          </span>
                          <p className="text-xs text-muted-foreground" dir="ltr">
                            {startsAt ? formatDate(startsAt) : "-"} — {endsAt ? formatDate(endsAt) : "-"}
                          </p>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-muted-foreground shrink-0" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* System Info */}
          <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground dark:text-white mb-4 uppercase tracking-wider">معلومات النظام</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1 border-b border-border dark:border-slate-800">
                <span className="text-muted-foreground">المعرف العام</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 text-xs">{user.public_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border dark:border-slate-800">
                <span className="text-muted-foreground">تم الإنشاء بواسطة</span>
                <span className="text-slate-700 dark:text-slate-300">{user.created_by?.name || "النظام"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">تاريخ التحديث</span>
                <span className="text-slate-700 dark:text-slate-300" dir="ltr">{formatDateTime(user.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

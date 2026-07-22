"use client";

import { useNotificationsList, useNotificationActions } from "@/hooks/use-notifications";
import { NotificationTypeBadge } from "./notification-type-badge";
import { NotificationReadBadge } from "./notification-read-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import Link from "next/link";

export function NotificationsList() {
  const { data, isLoading, error, params, setFilter, refresh } = useNotificationsList();
  const { markAsRead, isMarking } = useNotificationActions();

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
        {error.message || "حدث خطأ أثناء تحميل الإشعارات"}
        <Button variant="outline" className="mt-4 mx-auto block" onClick={refresh}>إعادة المحاولة</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border border-border">
        <div className="w-full sm:w-64 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">نوع الإشعار</label>
          <select 
            value={params.type || "all"} 
            onChange={(e) => setFilter("type", e.target.value === "all" ? "" : e.target.value)}
            className="flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
          >
            <option value="all">الكل</option>
            <option value="store_approved">تم قبول المحل</option>
            <option value="store_rejected">تم رفض المحل</option>
            <option value="store_activated">تفعيل المحل</option>
            <option value="store_deactivated">إيقاف المحل</option>
            <option value="subscription_assigned">تعيين اشتراك</option>
            <option value="subscription_cancelled">إلغاء اشتراك</option>
            <option value="subscription_expiring_soon">اقتراب انتهاء الاشتراك</option>
            <option value="subscription_expired">انتهاء الاشتراك</option>
          </select>
        </div>
        
        <div className="w-full sm:w-64 space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">حالة القراءة</label>
          <select 
            value={params.unread === true ? "unread" : params.unread === false ? "read" : "all"} 
            onChange={(e) => {
              const val = e.target.value;
              if (val === "all") {
                setFilter("unread", "");
              } else {
                setFilter("unread", val === "unread");
              }
            }}
            className="flex h-10 w-full rounded-md border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
          >
            <option value="all">الكل</option>
            <option value="unread">غير مقروء</option>
            <option value="read">مقروء</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-[150px]">النوع</TableHead>
                <TableHead className="w-[300px]">عنوان ونص الإشعار</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    جاري تحميل الإشعارات...
                  </TableCell>
                </TableRow>
              ) : !data?.data?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    لا توجد إشعارات مطابقة لخيارات البحث
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((notification) => (
                  <TableRow key={notification.id} className={!notification.is_read ? "bg-[#1E7D4E]/[0.02]" : ""}>
                    <TableCell>
                      <NotificationTypeBadge type={notification.type} />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className={`text-sm ${!notification.is_read ? "font-bold text-foreground" : "font-medium text-slate-800"}`}>
                          {notification.title_ar || "إشعار جديد"}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {notification.message_ar}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <NotificationReadBadge isRead={notification.is_read} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-sans" dir="ltr">
                      {format(parseISO(notification.created_at), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">

                        {!notification.is_read && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id, refresh)}
                            disabled={isMarking === notification.id}
                            className="bg-card hover:bg-muted"
                          >
                            {isMarking === notification.id ? "جاري..." : (
                              <>
                                <CheckCircle2 className="h-4 w-4 ml-1.5 text-muted-foreground" />
                                تحديد كمقروء
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.meta.last_page > 1 && (
          <div className="flex items-center justify-between border-t border-border bg-muted px-6 py-3">
            <div className="text-sm text-muted-foreground font-sans" dir="ltr">
              {data.meta.from} - {data.meta.to} of {data.meta.total}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilter("page", data.meta.current_page - 1)}
                disabled={data.meta.current_page === 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setFilter("page", data.meta.current_page + 1)}
                disabled={data.meta.current_page === data.meta.last_page}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

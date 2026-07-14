"use client";

import { useSubscriptionPlansList, useSubscriptionPlanActions } from "@/hooks/use-subscription-plans";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Search, Eye, Edit2, Plus, AlertTriangle, Play, Pause, Trash2 } from "lucide-react";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { PlanStatusBadge } from "./plan-badges";
import { PlanPrice, PlanDuration } from "./plan-formatting";
import { Modal } from "@/components/ui/modal";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function PlansList() {
  const { data, isLoading, error, params, setFilter, refresh } = useSubscriptionPlansList();
  const { activate, deactivate, remove, isSubmitting } = useSubscriptionPlanActions(refresh);
  const [selectedPlan, setSelectedPlan] = useState<{ id: string, action: "activate" | "deactivate" | "delete" } | null>(null);

  const handleAction = async () => {
    if (!selectedPlan) return;
    
    if (selectedPlan.action === "activate") {
      await activate(selectedPlan.id);
    } else if (selectedPlan.action === "deactivate") {
      await deactivate(selectedPlan.id);
    } else if (selectedPlan.action === "delete") {
      const success = await remove(selectedPlan.id);
      if (!success) {
        // If delete fails (like conflict), just close modal, toast will be shown
      }
    }
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="search"
            placeholder="ابحث باسم الخطة أو الرمز..."
            className="pl-3 pr-10"
            defaultValue={params.query}
            onChange={(e) => {
              const val = e.target.value;
              setTimeout(() => setFilter("query", val), 500);
            }}
          />
        </div>
        
        <select
          value={params.status || ""}
          onChange={(e) => setFilter("status", e.target.value)}
          className="flex h-10 w-full sm:w-48 items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 appearance-none"
        >
          <option value="">جميع الحالات</option>
          <option value="active">نشطة</option>
          <option value="inactive">غير نشطة</option>
        </select>
      </div>

      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg text-center">
          {error.message || "حدث خطأ أثناء تحميل الخطط"}
        </div>
      ) : (
        <div className="rounded-md border border-slate-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الخطة</TableHead>
                <TableHead className="text-right">السعر</TableHead>
                <TableHead className="text-right">المدة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-left w-[160px]">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    لا توجد خطط اشتراك مطابقة للبحث
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((plan) => (
                  <TableRow key={plan.public_id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">{plan.name_ar}</span>
                        <span className="text-xs text-slate-500 font-sans" dir="ltr">{plan.code}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <PlanPrice plan={plan} />
                    </TableCell>
                    <TableCell>
                      <PlanDuration days={plan.duration_days} />
                    </TableCell>
                    <TableCell>
                      <PlanStatusBadge isActive={plan.is_active} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-600">
                        {format(parseISO(plan.created_at), "d MMMM yyyy", { locale: ar })}
                      </span>
                    </TableCell>
                    <TableCell className="text-left">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" asChild title="عرض التفاصيل">
                          <Link href={`/subscription-plans/${plan.public_id}`}>
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">عرض</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild title="تعديل">
                          <Link href={`/subscription-plans/${plan.public_id}/edit`}>
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">تعديل</span>
                          </Link>
                        </Button>
                        
                        {plan.is_active ? (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                            title="تعطيل"
                            onClick={() => setSelectedPlan({ id: plan.public_id, action: "deactivate" })}
                          >
                            <Pause className="h-4 w-4" />
                            <span className="sr-only">تعطيل</span>
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-[#1E7D4E] hover:text-[#1E7D4E] hover:bg-[#EAF3EC]"
                            title="تفعيل"
                            onClick={() => setSelectedPlan({ id: plan.public_id, action: "activate" })}
                          >
                            <Play className="h-4 w-4" />
                            <span className="sr-only">تفعيل</span>
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="حذف"
                          onClick={() => setSelectedPlan({ id: plan.public_id, action: "delete" })}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">حذف</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {!isLoading && data && data.meta && data.meta.last_page > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={data.meta.current_page}
            totalPages={data.meta.last_page}
            onPageChange={(page) => setFilter("page", page)}
          />
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={!!selectedPlan}
        onClose={() => !isSubmitting && setSelectedPlan(null)}
        title={
          selectedPlan?.action === "activate" 
            ? "تفعيل الخطة" 
            : selectedPlan?.action === "deactivate" 
              ? "تعطيل الخطة" 
              : "حذف خطة الاشتراك"
        }
        description={
          selectedPlan?.action === "activate" 
            ? "هل تريد تفعيل هذه الخطة؟ ستظهر للمشتركين الجدد."
            : selectedPlan?.action === "deactivate"
              ? "هل تريد تعطيل هذه الخطة؟ لن تظهر الخطة للاشتراكات الجديدة، وقد تبقى الاشتراكات الحالية كما هي."
              : "هل أنت متأكد من حذف هذه الخطة؟ لا يمكن التراجع عن هذا الإجراء."
        }
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setSelectedPlan(null)} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button 
            onClick={handleAction} 
            disabled={isSubmitting}
            className={
              selectedPlan?.action === "delete" 
                ? "bg-red-600 hover:bg-red-700 text-white" 
                : selectedPlan?.action === "deactivate"
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-[#1E7D4E] hover:bg-[#0F3D2E] text-white"
            }
          >
            {isSubmitting ? "جاري الحفظ..." : "تأكيد"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

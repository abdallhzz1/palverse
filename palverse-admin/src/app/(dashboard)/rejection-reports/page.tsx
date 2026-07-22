"use client";

import { useEffect, useState } from "react";
import { FileX } from "lucide-react";
import { rejectionReportsService, RejectionReport } from "@/services/rejection-reports.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AdminRejectionReportsPage() {
  const [reports, setReports] = useState<RejectionReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await rejectionReportsService.getRejectionReports();
        setReports(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Failed to load rejection reports:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">تقارير الرفض (الزيارات غير الناجحة)</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تقارير رفض المتاجر المسجلة بواسطة المناديب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اسم النشاط</TableHead>
                  <TableHead className="text-right">المنطقة</TableHead>
                  <TableHead className="text-right">المندوب</TableHead>
                  <TableHead className="text-right">سبب الرفض</TableHead>
                  <TableHead className="text-right">مطلوب متابعة</TableHead>
                  <TableHead className="text-right">تاريخ الزيارة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : reports.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      لا توجد تقارير رفض مسجلة.
                    </TableCell>
                  </TableRow>
                ) : (
                  reports.map((report) => (
                    <TableRow key={report.public_id}>
                      <TableCell className="text-right">
                        <div className="flex items-center gap-2">
                          <FileX className="w-4 h-4 text-red-500" />
                          <div>
                            <div className="font-bold">{report.business_name}</div>
                            {report.owner_name && <div className="text-xs text-muted-foreground">{report.owner_name} - {report.phone}</div>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {report.zone?.name_ar || '-'}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {report.representative?.full_name || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div>
                          <span className="font-medium">{report.refusal_reason_label_ar}</span>
                          {report.refusal_reason_text && <div className="text-xs text-muted-foreground">{report.refusal_reason_text}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {report.follow_up_required ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                            نعم
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">لا</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {new Date(report.contacted_at).toLocaleDateString('ar-SA')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

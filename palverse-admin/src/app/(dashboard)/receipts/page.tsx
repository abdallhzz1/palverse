"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import { receiptsService, Receipt } from "@/services/receipts.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatDate } from "@/lib/utils/formatters";

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settlingId, setSettlingId] = useState<string | null>(null);

  const fetchReceipts = async () => {
    try {
      const res = await receiptsService.getReceipts();
      setReceipts(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Failed to load receipts:", error);
      toast.error("فشل في تحميل السندات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const handleSettle = async (publicId: string) => {
    if (!confirm("هل أنت متأكد من تأكيد توريد هذا السند؟")) return;
    
    setSettlingId(publicId);
    try {
      await receiptsService.settleReceipt(publicId);
      toast.success("تم تأكيد توريد السند بنجاح");
      await fetchReceipts();
    } catch (error) {
      console.error("Failed to settle receipt:", error);
      toast.error("حدث خطأ أثناء تأكيد التوريد");
    } finally {
      setSettlingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'issued': return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">مُصدر (قيد التوريد)</Badge>;
      case 'settled': return <Badge className="bg-green-100 text-green-800 border-green-200">تم التوريد</Badge>;
      case 'cancelled': return <Badge className="bg-red-100 text-red-800 border-red-200">ملغى</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{status}</Badge>;
    }
  };

  const getPaymentPurposeLabel = (purpose: string) => {
    switch(purpose) {
      case 'subscription': return 'اشتراك محل';
      case 'registration_fee': return 'رسوم تسجيل';
      case 'other': return 'أخرى';
      default: return purpose;
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">سندات القبض</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سندات القبض المحصلة من المحلات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">رقم السند</TableHead>
                  <TableHead className="text-right">المحل / الطلب</TableHead>
                  <TableHead className="text-right">غرض الدفع</TableHead>
                  <TableHead className="text-right">المبلغ</TableHead>
                  <TableHead className="text-right">تاريخ التحصيل</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-center">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      جاري التحميل...
                    </TableCell>
                  </TableRow>
                ) : receipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      لا توجد سندات قبض.
                    </TableCell>
                  </TableRow>
                ) : (
                  receipts.map((receipt) => (
                    <TableRow key={receipt.public_id}>
                      <TableCell className="font-medium text-right">{receipt.receipt_number}</TableCell>
                      <TableCell className="text-right">
                        {receipt.store?.name_ar || receipt.request?.store_name_ar || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {getPaymentPurposeLabel(receipt.payment_purpose)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {receipt.amount} {receipt.currency}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDate(receipt.collected_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {getStatusBadge(receipt.status)}
                      </TableCell>
                      <TableCell className="text-center">
                        {receipt.status === 'issued' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleSettle(receipt.public_id)}
                            disabled={settlingId === receipt.public_id}
                          >
                            <CheckCircle className="ml-2 h-4 w-4" />
                            تأكيد التوريد
                          </Button>
                        )}
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

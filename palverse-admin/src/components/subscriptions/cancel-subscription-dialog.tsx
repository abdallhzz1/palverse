"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useSubscriptionActions } from "@/hooks/use-subscriptions";

interface CancelSubscriptionDialogProps {
  publicId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CancelSubscriptionDialog({ publicId, isOpen, onClose, onSuccess }: CancelSubscriptionDialogProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { cancel, isSubmitting } = useSubscriptionActions(() => {
    setReason("");
    setError(null);
    if (onSuccess) onSuccess();
    onClose();
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 3) {
      setError("يجب إدخال سبب الإلغاء (3 أحرف على الأقل)");
      return;
    }
    
    setError(null);
    try {
      await cancel(publicId, { cancellation_reason: reason });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = err as any;
      if (normalized.errors?.cancellation_reason) {
        setError(normalized.errors.cancellation_reason[0]);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title="إلغاء الاشتراك"
      description="سيؤدي إلغاء الاشتراك إلى إيقاف فعالية هذه الخطة للمحل. لن يتم حذف السجل."
    >
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="reason">سبب الإلغاء <span className="text-red-500">*</span></Label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isSubmitting}
            className="flex min-h-[100px] w-full rounded-md border border-border bg-card px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-[#1E7D4E]"
            placeholder="يرجى توضيح سبب إلغاء هذا الاشتراك (إلزامي)..."
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            تراجع
          </Button>
          <Button type="submit" variant="danger" disabled={isSubmitting}>
            {isSubmitting ? "جاري الإلغاء..." : "تأكيد الإلغاء"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

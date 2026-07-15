import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminStore } from "@/types/store";
import { useStoreActions } from "@/hooks/use-store-details";
import { CheckCircle2, XCircle, Power, PowerOff } from "lucide-react";

interface StoreActionsProps {
  store: AdminStore;
  onSuccess: () => void;
}

export function StoreActions({ store, onSuccess }: StoreActionsProps) {
  const [activeModal, setActiveModal] = useState<"approve" | "reject" | "activate" | "deactivate" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  
  const { approve, reject, activate, deactivate, isSubmitting } = useStoreActions(store.public_id, () => {
    setActiveModal(null);
    onSuccess();
  });

  const closeModal = () => {
    if (!isSubmitting) setActiveModal(null);
  };

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    await reject({ rejection_reason: rejectionReason });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {store.status === "pending" && (
          <>
            <Button 
              onClick={() => setActiveModal("approve")} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 ml-2" />
              اعتماد
            </Button>
            <Button 
              variant="danger" 
              onClick={() => setActiveModal("reject")}
            >
              <XCircle className="w-4 h-4 ml-2" />
              رفض
            </Button>
          </>
        )}

        {store.status === "approved" && !store.is_active && (
          <Button 
            onClick={() => setActiveModal("activate")}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Power className="w-4 h-4 ml-2" />
            تفعيل
          </Button>
        )}

        {store.status === "approved" && store.is_active && (
          <Button 
            variant="danger" 
            onClick={() => setActiveModal("deactivate")}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <PowerOff className="w-4 h-4 ml-2" />
            تعطيل
          </Button>
        )}
      </div>

      {/* Approve Modal */}
      <Modal isOpen={activeModal === "approve"} onClose={closeModal} title="قبول المحل" description="هل تريد اعتماد هذا المحل؟">
        <div className="py-4">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            بعد الاعتماد قد يحتاج المحل إلى اشتراك نشط ليظهر للعامة.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
          <Button onClick={() => approve()} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">تأكيد الاعتماد</Button>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal isOpen={activeModal === "reject"} onClose={closeModal} title="رفض المحل" description="يرجى إدخال سبب الرفض بوضوح ليتمكن التاجر من تعديل البيانات.">
        <form onSubmit={handleReject} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">سبب الرفض</Label>
            <Input 
              id="rejection_reason" 
              value={rejectionReason} 
              onChange={e => setRejectionReason(e.target.value)} 
              disabled={isSubmitting} 
              required 
              autoFocus
            />
            <p className="text-xs text-amber-600 dark:text-amber-400">
              سيصل سبب الرفض إلى صاحب المحل ليتمكن من تعديل البيانات وإعادة الإرسال.
            </p>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
            <Button type="submit" variant="danger" disabled={isSubmitting || !rejectionReason.trim()}>تأكيد الرفض</Button>
          </div>
        </form>
      </Modal>

      {/* Activate Modal */}
      <Modal isOpen={activeModal === "activate"} onClose={closeModal} title="تفعيل المحل" description="هل تريد تفعيل هذا المحل؟">
        <div className="py-4">
          <p className="text-sm text-muted-foreground dark:text-muted-foreground">
            تفعيل المحل لا يجعله ظاهراً للعامة بالضرورة إذا لم يكن لديه اشتراك نشط.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
          <Button onClick={() => activate()} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">تأكيد التفعيل</Button>
        </div>
      </Modal>

      {/* Deactivate Modal */}
      <Modal isOpen={activeModal === "deactivate"} onClose={closeModal} title="تعطيل المحل" description="هل تريد تعطيل هذا المحل؟">
        <div className="py-4">
          <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
            سيتم إخفاء المحل عن الظهور العام حتى تتم إعادة تفعيله.
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
          <Button onClick={() => deactivate()} variant="danger" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 text-white">تأكيد التعطيل</Button>
        </div>
      </Modal>
    </>
  );
}

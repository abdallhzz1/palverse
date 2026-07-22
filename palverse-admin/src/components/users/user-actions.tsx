"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { ManagedUser, UserRole } from "@/types/user";
import { useUserActions } from "@/hooks/use-user-detail";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ShieldAlert, ShieldX, KeyRound, LogOut, CheckCircle, Ban } from "lucide-react";

interface UserActionsProps {
  user: ManagedUser;
  onSuccess: () => void;
}

export function UserActions({ user, onSuccess }: UserActionsProps) {
  const { user: currentUser } = useAuth();
  const { activate, deactivate, suspend, updateRoles, resetPassword, revokeTokens, isSubmitting } = useUserActions(user.public_id, onSuccess);
  
  const [activeModal, setActiveModal] = useState<"deactivate" | "suspend" | "roles" | "password" | "revoke" | null>(null);
  
  // Form states
  const [reason, setReason] = useState("");
  const [revokeTokensFlag, setRevokeTokensFlag] = useState(true);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(user.roles);

  const isSelf = currentUser?.public_id === user.public_id;
  const isLastAdmin = false; // Note: In a fully complete app, you'd calculate if they are the only admin left, or rely entirely on backend throwing 409. The requirement says: "handle LAST_ADMIN_PROTECTION from backend". The hook maps 409 safely.

  const closeModal = () => {
    setActiveModal(null);
    setReason("");
    setPassword("");
    setPasswordConfirm("");
  };

  const handleDeactivate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await deactivate({ reason, revoke_tokens: revokeTokensFlag });
    if (success) closeModal();
  };

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return; // Required
    const success = await suspend({ suspension_reason: reason, revoke_tokens: revokeTokensFlag });
    if (success) closeModal();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirm) return;
    const success = await resetPassword({ password, password_confirmation: passwordConfirm, revoke_tokens: revokeTokensFlag });
    if (success) closeModal();
  };

  const handleRevokeTokens = async () => {
    const success = await revokeTokens();
    if (success) closeModal();
  };

  const handleUpdateRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoles.length === 0) return;
    const success = await updateRoles({ roles: selectedRoles });
    if (success) closeModal();
  };

  const toggleRole = (role: UserRole) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  return (
    <>
      <div className="bg-card dark:bg-[#1F2522] rounded-xl border border-border dark:border-emerald-900/30 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-foreground dark:text-white mb-4">الإجراءات الإدارية</h3>
        
        {isSelf && (
          <div className="mb-4 p-3 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 rounded-lg text-sm flex items-start gap-2">
            <span className="font-semibold shrink-0">ملاحظة:</span>
            <p>هذا هو حسابك الحالي. بعض الإجراءات الإدارية مقيدة لتجنب قفل حسابك عن طريق الخطأ.</p>
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          {/* Activate is quick action */}
          {(user.status === "inactive" || user.status === "suspended") && (
            <Button
              onClick={() => {
                if(window.confirm("هل تريد تفعيل هذا الحساب؟")) activate();
              }}
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle className="w-4 h-4 mr-2 ml-2" />
              تفعيل الحساب
            </Button>
          )}

          {user.status === "active" && !isSelf && (
            <>
              <Button
                onClick={() => setActiveModal("deactivate")}
                variant="outline"
                className="text-slate-700 hover:text-foreground hover:bg-muted"
              >
                <Ban className="w-4 h-4 mr-2 ml-2" />
                تعطيل
              </Button>
              <Button
                onClick={() => setActiveModal("suspend")}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <ShieldAlert className="w-4 h-4 mr-2 ml-2" />
                إيقاف (حظر)
              </Button>
            </>
          )}

          {!isSelf && (
            <Button
              onClick={() => setActiveModal("roles")}
              variant="outline"
            >
              <ShieldX className="w-4 h-4 mr-2 ml-2" />
              تغيير الأدوار
            </Button>
          )}

          <Button
            onClick={() => setActiveModal("password")}
            variant="outline"
          >
            <KeyRound className="w-4 h-4 mr-2 ml-2" />
            إعادة تعيين كلمة المرور
          </Button>

          <Button
            onClick={() => setActiveModal("revoke")}
            variant="outline"
            className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
          >
            <LogOut className="w-4 h-4 mr-2 ml-2" />
            سحب الجلسات (تسجيل خروج إجباري)
          </Button>
        </div>
      </div>

      {/* Deactivate Modal */}
      <Modal isOpen={activeModal === "deactivate"} onClose={closeModal} title="تعطيل المستخدم" description="سيتم منع المستخدم من تسجيل الدخول وقد يتم سحب جلساته الحالية.">
        <form onSubmit={handleDeactivate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deactivate_reason">السبب (اختياري)</Label>
            <Input id="deactivate_reason" value={reason} onChange={e => setReason(e.target.value)} disabled={isSubmitting} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="deactivate_revoke" checked={revokeTokensFlag} onChange={e => setRevokeTokensFlag(e.target.checked)} disabled={isSubmitting} className="rounded border-slate-300" />
            <Label htmlFor="deactivate_revoke">سحب الجلسات الحالية فوراً</Label>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting}>تأكيد التعطيل</Button>
          </div>
        </form>
      </Modal>

      {/* Suspend Modal */}
      <Modal isOpen={activeModal === "suspend"} onClose={closeModal} title="إيقاف المستخدم" description="سيتم إيقاف الحساب ومنع المستخدم من تسجيل الدخول نهائياً.">
        <form onSubmit={handleSuspend} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="suspend_reason">سبب الإيقاف (مطلوب)</Label>
            <Input id="suspend_reason" value={reason} onChange={e => setReason(e.target.value)} disabled={isSubmitting} required />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="suspend_revoke" checked={revokeTokensFlag} onChange={e => setRevokeTokensFlag(e.target.checked)} disabled={isSubmitting} className="rounded border-slate-300" />
            <Label htmlFor="suspend_revoke">سحب الجلسات الحالية فوراً</Label>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
            <Button type="submit" variant="danger" disabled={isSubmitting || !reason.trim()} className="bg-red-600 hover:bg-red-700">تأكيد الإيقاف</Button>
          </div>
        </form>
      </Modal>

      {/* Roles Modal */}
      <Modal isOpen={activeModal === "roles"} onClose={closeModal} title="تعديل أدوار المستخدم" description="حدد الصلاحيات التي يجب أن يتمتع بها هذا المستخدم.">
        <form onSubmit={handleUpdateRoles} className="space-y-4">
          <div className="space-y-3">
            {[
              { id: "admin", label: "مدير (Admin)", desc: "صلاحيات كاملة للوصول إلى لوحة التحكم." },
              { id: "merchant", label: "صاحب محل", desc: "إدارة المحلات الخاصة به وطلباته." },
              { id: "representative", label: "مندوب مبيعات (Representative)", desc: "إدارة طلبات المتاجر، الزيارات الميدانية وعمولات التسجيل." },
              { id: "follow_up", label: "متابعة (Follow-up)", desc: "متابعة الاشتراكات غير المدفوعة والتواصل مع التجار." }
            ].map(role => (
              <div key={role.id} className="flex items-start gap-3 p-3 border border-border dark:border-slate-700 rounded-lg">
                <input 
                  type="checkbox" 
                  id={`role_${role.id}`} 
                  checked={selectedRoles.includes(role.id as UserRole)}
                  onChange={() => toggleRole(role.id as UserRole)}
                  disabled={isSubmitting}
                  className="mt-1 rounded border-slate-300" 
                />
                <div>
                  <Label htmlFor={`role_${role.id}`} className="font-semibold">{role.label}</Label>
                  <p className="text-xs text-muted-foreground">{role.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting || selectedRoles.length === 0}>حفظ التعديلات</Button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal isOpen={activeModal === "password"} onClose={closeModal} title="إعادة تعيين كلمة المرور" description="سيتم تغيير كلمة المرور وقد تُسحب الجلسات الحالية.">
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
            <Input id="new_password" type="password" dir="ltr" value={password} onChange={e => setPassword(e.target.value)} disabled={isSubmitting} required minLength={8} className="text-left" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">تأكيد كلمة المرور</Label>
            <Input id="confirm_password" type="password" dir="ltr" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} disabled={isSubmitting} required minLength={8} className="text-left" />
            {password && passwordConfirm && password !== passwordConfirm && (
              <p className="text-sm text-red-500">كلمات المرور غير متطابقة</p>
            )}
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="pass_revoke" checked={revokeTokensFlag} onChange={e => setRevokeTokensFlag(e.target.checked)} disabled={isSubmitting} className="rounded border-slate-300" />
            <Label htmlFor="pass_revoke">سحب الجلسات الحالية فوراً</Label>
          </div>
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
            <Button type="submit" disabled={isSubmitting || !password || password !== passwordConfirm}>تعيين كلمة المرور</Button>
          </div>
        </form>
      </Modal>

      {/* Revoke Tokens Modal */}
      <Modal isOpen={activeModal === "revoke"} onClose={closeModal} title="سحب جميع الجلسات" description="هل تريد تسجيل خروج هذا المستخدم من جميع الأجهزة النشطة حالياً؟">
        <div className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>إلغاء</Button>
          <Button type="button" onClick={handleRevokeTokens} disabled={isSubmitting} variant="danger" className="bg-orange-600 hover:bg-orange-700">تأكيد تسجيل الخروج</Button>
        </div>
      </Modal>
    </>
  );
}

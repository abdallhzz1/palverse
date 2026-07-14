import { useState, useEffect, useCallback } from "react";
import { usersService } from "@/services/users.service";
import { ManagedUser, UpdateUserRolesRequest, ResetUserPasswordRequest, UpdateUserRequest, DeactivateUserRequest, SuspendUserRequest } from "@/types/user";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export function useUserDetail(publicId: string) {
  const [user, setUser] = useState<ManagedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchUser = useCallback(async (isSilent = false) => {
    if (!publicId) return;
    
    if (!isSilent) setIsLoading(true);
    setError(null);

    try {
      const data = await usersService.getByPublicId(publicId);
      setUser(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      if (!publicId) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await usersService.getByPublicId(publicId);
        if (isMounted) setUser(data);
      } catch (err) {
        if (isMounted) setError(normalizeApiError(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [publicId]);

  return {
    user,
    isLoading,
    error,
    refresh: () => fetchUser(true),
  };
}

export function useUserActions(publicId: string, onSuccess?: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const withToastAndRefresh = async (action: () => Promise<unknown>, successMessage: string) => {
    setIsSubmitting(true);
    try {
      await action();
      toast.success(successMessage);
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      const error = normalizeApiError(err);
      toast.error(error.message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const activate = () => 
    withToastAndRefresh(() => usersService.activate(publicId), "تم تفعيل المستخدم بنجاح");

  const deactivate = (payload: DeactivateUserRequest) => 
    withToastAndRefresh(() => usersService.deactivate(publicId, payload), "تم تعطيل المستخدم بنجاح");

  const suspend = (payload: SuspendUserRequest) => 
    withToastAndRefresh(() => usersService.suspend(publicId, payload), "تم تعليق حساب المستخدم بنجاح");

  const updateRoles = (payload: UpdateUserRolesRequest) => 
    withToastAndRefresh(() => usersService.updateRoles(publicId, payload), "تم تعديل أدوار المستخدم بنجاح");

  const revokeTokens = () => 
    withToastAndRefresh(() => usersService.revokeTokens(publicId), "تم إلغاء جميع الجلسات النشطة بنجاح");

  const resetPassword = (payload: ResetUserPasswordRequest) => 
    withToastAndRefresh(() => usersService.resetPassword(publicId, payload), "تم إعادة تعيين كلمة المرور بنجاح");

  const update = (payload: UpdateUserRequest) => 
    withToastAndRefresh(() => usersService.update(publicId, payload), "تم تحديث بيانات المستخدم بنجاح");

  return {
    activate,
    deactivate,
    suspend,
    updateRoles,
    revokeTokens,
    resetPassword,
    update,
    isSubmitting,
  };
}

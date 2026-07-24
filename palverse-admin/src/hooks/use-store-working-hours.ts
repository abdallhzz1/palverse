import { useCallback, useEffect, useState } from "react";
import { storesService } from "@/services/stores.service";
import { WorkingHours } from "@/types/store";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export function useStoreWorkingHours(publicId: string) {
  const [hours, setHours] = useState<WorkingHours>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchHours = useCallback(async () => {
    if (!publicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await storesService.getWorkingHours(publicId);
      setHours(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    fetchHours();
  }, [fetchHours]);

  const save = async (nextHours: WorkingHours) => {
    setIsSaving(true);
    try {
      const data = await storesService.updateWorkingHours(publicId, nextHours);
      setHours(data);
      toast.success("تم حفظ ساعات العمل بنجاح");
      return true;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return { hours, setHours, isLoading, isSaving, error, save, refresh: fetchHours };
}

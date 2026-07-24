import { useCallback, useEffect, useState } from "react";
import { storesService } from "@/services/stores.service";
import { SocialLinkPayload, StoreSocialLinkItem } from "@/types/store";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export function useStoreSocialLinks(publicId: string) {
  const [links, setLinks] = useState<StoreSocialLinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchLinks = useCallback(async () => {
    if (!publicId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await storesService.getSocialLinks(publicId);
      setLinks(data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const create = async (payload: SocialLinkPayload) => {
    setIsSubmitting(true);
    try {
      await storesService.addSocialLink(publicId, payload);
      toast.success("تم إضافة الرابط بنجاح");
      await fetchLinks();
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message);
      throw normalized;
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = async (linkId: string, payload: SocialLinkPayload) => {
    setIsSubmitting(true);
    try {
      await storesService.updateSocialLink(publicId, linkId, payload);
      toast.success("تم تحديث الرابط بنجاح");
      await fetchLinks();
      return true;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message);
      throw normalized;
    } finally {
      setIsSubmitting(false);
    }
  };

  const remove = async (linkId: string) => {
    try {
      await storesService.deleteSocialLink(publicId, linkId);
      toast.success("تم حذف الرابط بنجاح");
      setLinks((prev) => prev.filter((l) => l.public_id !== linkId));
      return true;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return false;
    }
  };

  return { links, isLoading, isSubmitting, error, create, update, remove, refresh: fetchLinks };
}

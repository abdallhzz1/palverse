import { useCallback, useEffect, useState } from "react";
import { storesService } from "@/services/stores.service";
import { StoreOffer, StoreOfferPayload, StoreOffersMeta } from "@/types/store";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";
import { toast } from "sonner";

export function useStoreOffersList(publicId: string) {
  const [offers, setOffers] = useState<StoreOffer[]>([]);
  const [meta, setMeta] = useState<StoreOffersMeta | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchOffers = useCallback(
    async (targetPage: number = page) => {
      if (!publicId) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await storesService.getOffers(publicId, targetPage);
        setOffers(response.data);
        setMeta(response.meta);
      } catch (err) {
        setError(normalizeApiError(err));
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [publicId]
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      await fetchOffers(page);
    };
    if (isMounted) load();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicId, page]);

  const remove = async (offerId: string) => {
    try {
      await storesService.deleteOffer(publicId, offerId);
      toast.success("تم حذف العرض بنجاح");
      await fetchOffers(page);
      return true;
    } catch (err) {
      toast.error(normalizeApiError(err).message);
      return false;
    }
  };

  return { offers, meta, page, setPage, isLoading, error, refresh: () => fetchOffers(page), remove };
}

export function useStoreOfferDetails(publicId: string, offerId: string) {
  const [offer, setOffer] = useState<StoreOffer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  useEffect(() => {
    if (!publicId || !offerId) return;
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await storesService.getOffer(publicId, offerId);
        if (isMounted) setOffer(data);
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
  }, [publicId, offerId]);

  return { offer, isLoading, error };
}

export function useStoreOfferMutations(publicId: string) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const create = async (payload: StoreOfferPayload) => {
    setIsSubmitting(true);
    try {
      const data = await storesService.createOffer(publicId, payload);
      toast.success("تم إضافة العرض بنجاح");
      return data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message);
      throw normalized;
    } finally {
      setIsSubmitting(false);
    }
  };

  const update = async (offerId: string, payload: StoreOfferPayload) => {
    setIsSubmitting(true);
    try {
      const data = await storesService.updateOffer(publicId, offerId, payload);
      toast.success("تم تحديث العرض بنجاح");
      return data;
    } catch (err) {
      const normalized = normalizeApiError(err);
      toast.error(normalized.message);
      throw normalized;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { create, update, isSubmitting };
}

import { useState, useEffect, useCallback } from "react";
import { storeRequestsService } from "@/services/store-requests.service";
import { StoreRegistrationRequest } from "@/types/store-requests";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";

export function useStoreRequestDetails(publicId: string) {
  const [data, setData] = useState<StoreRegistrationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchDetails = useCallback(async () => {
    if (!publicId) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await storeRequestsService.getByPublicId(publicId);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [publicId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDetails();
  }, [fetchDetails]);

  return {
    data,
    isLoading,
    error,
    refresh: fetchDetails,
    setData
  };
}

import { useState, useCallback, useEffect } from "react";
import { settingsService } from "@/services/settings.service";
import { SystemSettings, SettingsGroup, SettingsGroupName } from "@/types/settings";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";

export function useSettings() {
  const [data, setData] = useState<SystemSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await settingsService.getAll();
      setData(response.data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSettings();
  }, [fetchSettings]);

  return { data, isLoading, error, refresh: fetchSettings };
}

export function useSettingsGroup(group: SettingsGroupName) {
  const [data, setData] = useState<SettingsGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  const fetchGroup = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await settingsService.getGroup(group);
      setData(response.data);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, [group]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchGroup();
  }, [fetchGroup]);

  return { data, isLoading, error, refresh: fetchGroup };
}

export function useSettingsActions() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [apiError, setApiError] = useState<NormalizedApiError | null>(null);

  const updateGroup = useCallback(async (group: SettingsGroupName, values: Record<string, unknown>, onSuccess?: () => void) => {
    setIsUpdating(true);
    setApiError(null);
    try {
      await settingsService.updateGroup(group, { settings: values });
      if (onSuccess) onSuccess();
      return true;
    } catch (err) {
      setApiError(normalizeApiError(err));
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return { updateGroup, isUpdating, apiError };
}

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { usersService } from "@/services/users.service";
import { UsersListParams, UsersListResponse, UserStatus, UserRole } from "@/types/user";
import { normalizeApiError, NormalizedApiError } from "@/lib/api/error";

export function useUsersList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [data, setData] = useState<UsersListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<NormalizedApiError | null>(null);

  // Extract initial filters from URL or use defaults
  const [filters, setFilters] = useState<UsersListParams>({
    page: Number(searchParams.get("page")) || 1,
    per_page: Number(searchParams.get("per_page")) || 15,
    query: searchParams.get("query") || "",
    status: (searchParams.get("status") as UserStatus) || "",
    role: (searchParams.get("role") as UserRole) || "",
    sort: (searchParams.get("sort") as "newest" | "oldest" | "name" | "email" | "last_login") || "newest",
    direction: (searchParams.get("direction") as "asc" | "desc") || "desc",
  });

  const fetchUsers = useCallback(async (currentFilters: UsersListParams, isSilent = false) => {
    if (!isSilent) setIsLoading(true);
    setError(null);

    try {
      const response = await usersService.list(currentFilters);
      setData(response);
    } catch (err) {
      setError(normalizeApiError(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync URL to Filters
  const updateUrl = useCallback(
    (newFilters: UsersListParams) => {
      const params = new URLSearchParams(searchParams.toString());
      
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value) {
          params.set(key, String(value));
        } else {
          params.delete(key);
        }
      });

      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  // When filters change, update URL and refetch
  const handleFilterChange = <K extends keyof UsersListParams>(key: K, value: UsersListParams[K]) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };
      
      // Reset page to 1 on any filter change except page itself
      if (key !== "page") {
        newFilters.page = 1;
      }

      updateUrl(newFilters);
      return newFilters;
    });
  };

  // Fetch data on initial load and when filters state changes
  useEffect(() => {
    let isMounted = true;
    
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await usersService.list(filters);
        if (isMounted) setData(response);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.per_page,
    filters.query,
    filters.status,
    filters.role,
    filters.sort,
    filters.direction,
  ]);

  return {
    data,
    isLoading,
    error,
    filters,
    setFilter: handleFilterChange,
    refresh: () => fetchUsers(filters, true),
  };
}

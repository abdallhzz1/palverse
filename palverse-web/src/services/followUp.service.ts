import { apiClient } from "@/lib/api/client";

export const followUpService = {
  getDashboardSummary: async () => {
    const response = await apiClient.get<{ data: any }>("/follow-up/dashboard/summary");
    return response.data;
  },

  getStoreRequests: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString(), ...filters });
    const response = await apiClient.get<{ data: any[], meta: any }>(`/follow-up/store-requests?${params.toString()}`);
    // Handle nested data from response
    return {
      data: response.data || [],
      meta: (response as any).meta || null,
    };
  },

  getStoreRequest: async (publicId: string) => {
    const response = await apiClient.get<{ data: any }>(`/follow-up/store-requests/${publicId}`);
    return response.data;
  },

  reviewStoreRequest: async (publicId: string, action: string, reason?: string) => {
    const response = await apiClient.post<{ data: any }>(`/follow-up/store-requests/${publicId}/review`, {
      action,
      reason,
    });
    return response.data;
  },

  getRenewals: async (page = 1, filters = {}) => {
    const params = new URLSearchParams({ page: page.toString(), ...filters });
    const response = await apiClient.get<{ data: any[], meta: any }>(`/follow-up/renewals?${params.toString()}`);
    return {
      data: response.data || [],
      meta: (response as any).meta || null,
    };
  },

  getRenewal: async (publicId: string) => {
    const response = await apiClient.get<{ data: any }>(`/follow-up/renewals/${publicId}`);
    return response.data;
  },

  getUnpaidSubscriptions: async (page = 1) => {
    const params = new URLSearchParams({ page: page.toString() });
    const response = await apiClient.get<{ data: any[], meta: any }>(`/follow-up/unpaid-subscriptions?${params.toString()}`);
    return {
      data: response.data || [],
      meta: (response as any).meta || null,
    };
  },

  getUnpaidSubscription: async (publicId: string) => {
    const response = await apiClient.get<{ data: any }>(`/follow-up/unpaid-subscriptions/${publicId}`);
    return response.data;
  },

  getCalls: async (page = 1) => {
    const params = new URLSearchParams({ page: page.toString() });
    const response = await apiClient.get<{ data: any[], meta: any }>(`/follow-up/calls?${params.toString()}`);
    return {
      data: response.data || [],
      meta: (response as any).meta || null,
    };
  },

  getCall: async (publicId: string) => {
    const response = await apiClient.get<{ data: any }>(`/follow-up/calls/${publicId}`);
    return response.data;
  },

  createCall: async (data: any) => {
    const response = await apiClient.post<{ data: any }>("/follow-up/calls", data);
    return response.data;
  },

  updateCall: async (publicId: string, data: any) => {
    const response = await apiClient.put<{ data: any }>(`/follow-up/calls/${publicId}`, data);
    return response.data;
  },

  getRepresentatives: async (page = 1) => {
    const params = new URLSearchParams({ page: page.toString() });
    const response = await apiClient.get<{ data: any[], meta: any }>(`/follow-up/representatives?${params.toString()}`);
    return {
      data: response.data || [],
      meta: (response as any).meta || null,
    };
  },

  getRepresentative: async (publicId: string) => {
    return apiClient.get(`/follow-up/representatives/${publicId}`);
  },

  createRepresentative: async (data: Record<string, any>) => {
    return apiClient.post('/follow-up/representatives', data);
  },

  // Receipts
  getReceipts: async (page = 1, status = 'all') => {
    const params = new URLSearchParams({ page: page.toString() });
    if (status !== 'all') params.append('status', status);
    
    const response = await apiClient.get<{ data: any[], meta: any }>(`/follow-up/receipts?${params.toString()}`);
    return {
      data: response.data || [],
      meta: (response as any).meta || null,
    };
  },

  settleReceipt: async (publicId: string) => {
    return apiClient.post(`/follow-up/receipts/${publicId}/settle`);
  },

  // Rejection Reports
  getRejectionReports: async (page = 1) => {
    const params = new URLSearchParams({ page: page.toString() });
    const response = await apiClient.get<{ data: any[]; meta: any }>(`/follow-up/rejection-reports?${params.toString()}`);
    const payload = response as { data?: any[] | { data?: any[] }; meta?: any };
    const rows = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.data?.data)
        ? payload.data.data
        : [];

    return {
      data: rows,
      meta: payload.meta ?? null,
    };
  },
};

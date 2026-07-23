import { apiClient } from '@/lib/api/client';
import {
  RepresentativeDashboardSummary,
  RepresentativeDashboardActivity,
  RepresentativeZone,
  StoreRegistrationRequest,
  RejectionReport,
  CommissionRecord,
  CollectionReceipt
} from '@/types/representative';

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}

export const RepresentativeService = {
  // Dashboard
  getDashboard: async (): Promise<{ data: { summary: RepresentativeDashboardSummary, activity: RepresentativeDashboardActivity } }> => {
    return apiClient.get('/representative/dashboard/summary') as any;
  },

  // Zones
  getZones: async (): Promise<{ data: RepresentativeZone[] }> => {
    return apiClient.get('/representative/zones') as any;
  },

  // Store Registration Requests
  getStoreRequests: async (page = 1, status = 'all'): Promise<PaginatedResponse<StoreRegistrationRequest>> => {
    return apiClient.get(`/representative/store-requests?page=${page}&status=${status}`) as any;
  },

  getStoreRequest: async (publicId: string): Promise<{ data: StoreRegistrationRequest }> => {
    return apiClient.get(`/representative/store-requests/${publicId}`) as any;
  },

  createStoreRequest: async (data: Partial<StoreRegistrationRequest> & { zone_public_id: string; city_public_id: string; category_public_id?: string }): Promise<{ data: StoreRegistrationRequest }> => {
    return apiClient.post('/representative/store-requests', data) as any;
  },

  updateStoreRequest: async (publicId: string, data: Partial<StoreRegistrationRequest> & { zone_public_id?: string; city_public_id?: string; category_public_id?: string }): Promise<{ data: StoreRegistrationRequest }> => {
    return apiClient.put(`/representative/store-requests/${publicId}`, data) as any;
  },

  submitStoreRequest: async (publicId: string): Promise<{ data: StoreRegistrationRequest }> => {
    return apiClient.post(`/representative/store-requests/${publicId}/submit`) as any;
  },

  // Rejection Reports
  getRejectionReports: async (page = 1): Promise<PaginatedResponse<RejectionReport>> => {
    const response = (await apiClient.get(
      `/representative/rejection-reports?page=${page}`
    )) as PaginatedResponse<RejectionReport> & { data?: RejectionReport[] | { data?: RejectionReport[] } };

    const rows = Array.isArray(response.data)
      ? response.data
      : Array.isArray((response.data as { data?: RejectionReport[] } | undefined)?.data)
        ? ((response.data as { data: RejectionReport[] }).data)
        : [];

    return {
      ...response,
      data: rows,
    };
  },

  createRejectionReport: async (data: Partial<RejectionReport> & { zone_public_id: string }): Promise<{ data: RejectionReport }> => {
    return apiClient.post('/representative/rejection-reports', data) as any;
  },

  // Commissions
  getCommissions: async (page = 1): Promise<PaginatedResponse<CommissionRecord>> => {
    return apiClient.get(`/representative/commissions?page=${page}`) as any;
  },

  // Receipts
  getReceipts: async (page = 1): Promise<PaginatedResponse<CollectionReceipt>> => {
    return apiClient.get(`/representative/receipts?page=${page}`) as any;
  },

  createReceipt: async (data: Partial<CollectionReceipt> & { store_public_id?: string; store_registration_request_public_id?: string }): Promise<{ data: CollectionReceipt }> => {
    return apiClient.post('/representative/receipts', data) as any;
  },
};

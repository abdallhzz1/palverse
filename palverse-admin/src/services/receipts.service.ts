import { apiClient } from "@/lib/api/client";

export interface Receipt {
  public_id: string;
  receipt_number: string;
  amount: string;
  currency: string;
  payment_purpose: string;
  collected_at: string;
  status: string;
  store?: {
    public_id: string;
    name_ar: string;
    slug: string;
  };
  request?: {
    public_id: string;
    store_name_ar: string;
  };
}

export const receiptsService = {
  getReceipts: async (page = 1, status = 'all') => {
    const params = new URLSearchParams({ page: page.toString() });
    if (status !== 'all') params.append('status', status);
    
    const response = await apiClient.get<{ data: Receipt[], meta: any }>(`/admin/receipts?${params.toString()}`);
    return {
      data: response.data || [],
      meta: (response as any).meta || null,
    };
  },

  settleReceipt: async (publicId: string) => {
    return apiClient.post(`/admin/receipts/${publicId}/settle`);
  },
};

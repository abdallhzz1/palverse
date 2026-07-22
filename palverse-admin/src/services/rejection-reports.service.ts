import { apiClient } from "@/lib/api/client";

export interface RejectionReport {
  public_id: string;
  business_name: string;
  owner_name: string;
  phone: string;
  refusal_reason_code: string;
  refusal_reason_label_ar: string;
  refusal_reason_text: string;
  follow_up_required: boolean;
  notes: string;
  contacted_at: string;
  zone: {
    public_id: string;
    name_ar: string;
  };
  representative: {
    public_id: string;
    full_name: string;
  };
}

export const rejectionReportsService = {
  getRejectionReports: async (page = 1) => {
    const params = new URLSearchParams({ page: page.toString() });
    
    const response = await apiClient.get<{ data: RejectionReport[], meta: any }>(`/admin/rejection-reports?${params.toString()}`);
    return {
      data: response.data || [],
      meta: (response as any).meta || null,
    };
  },
};

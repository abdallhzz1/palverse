export type StoreRequestStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'needs_changes' | 'cancelled';
export type CommissionStatus = 'pending' | 'approved' | 'payable' | 'paid' | 'cancelled';
export type RepresentativeStatus = 'active' | 'inactive' | 'suspended';
export type CollectionReceiptStatus = 'issued' | 'settled' | 'cancelled';
export type RefusalReasonCode = 'price' | 'not_interested' | 'already_subscribed' | 'needs_more_information' | 'contact_later' | 'trust_concern' | 'other';

export interface RepresentativeZone {
  public_id: string;
  is_active: boolean;
  assigned_at: string | null;
  notes: string | null;
  zone: {
    public_id: string;
    name_ar: string;
    name_en: string | null;
    city: {
      public_id: string;
      name_ar: string;
      name_en: string | null;
    };
  };
}

export interface StoreRequestStatusHistory {
  from_status: StoreRequestStatus | null;
  to_status: StoreRequestStatus;
  note: string | null;
  created_at: string;
}

export interface StoreRegistrationRequest {
  public_id: string;
  proposed_merchant_name: string;
  proposed_merchant_phone: string;
  proposed_merchant_email: string | null;
  store_name_ar: string;
  store_name_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  phone: string;
  whatsapp: string | null;
  address_ar: string;
  address_en: string | null;
  latitude: number | null;
  longitude: number | null;
  status: StoreRequestStatus;
  status_label_ar: string;
  representative_notes: string | null;
  admin_notes?: string | null;
  rejection_reason?: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  zone?: {
    public_id: string;
    name_ar: string;
    name_en: string | null;
  };
  city?: {
    public_id: string;
    name_ar: string;
    name_en: string | null;
  };
  category?: {
    public_id: string;
    name_ar: string;
    name_en: string | null;
  };
  resulting_store?: {
    public_id: string;
    name_ar: string;
    slug: string;
  };
  status_history?: StoreRequestStatusHistory[];
}

export interface CommissionRecord {
  public_id: string;
  amount: number;
  currency: string;
  status: CommissionStatus;
  reason: string;
  earned_at: string;
  approved_at: string | null;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  request?: {
    public_id: string;
    store_name_ar: string;
  };
}

export interface CollectionReceipt {
  public_id: string;
  receipt_number: string;
  amount: number;
  currency: string;
  payment_purpose: string;
  collected_at: string;
  notes: string | null;
  status: CollectionReceiptStatus;
  settled_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
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

export interface RejectionReport {
  public_id: string;
  business_name: string;
  owner_name: string | null;
  phone: string | null;
  refusal_reason_code: RefusalReasonCode;
  refusal_reason_label_ar: string;
  refusal_reason_text: string | null;
  contacted_at: string;
  follow_up_required: boolean;
  notes: string | null;
  created_at: string;
  zone?: {
    public_id: string;
    name_ar: string;
    name_en: string | null;
  };
  representative?: {
    public_id: string;
    full_name: string;
  };
}

export interface RepresentativeDashboardSummary {
  zones: {
    assigned_count: number;
  };
  requests: {
    total: number;
    draft: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
    needs_changes: number;
  };
  commissions: {
    pending_count: number;
    paid_count: number;
    pending_total: number;
    paid_total: number;
  };
  receipts: {
    issued_count: number;
    settled_count: number;
    total_collected: number;
    total_settled: number;
    outstanding: number;
  };
}

export interface RepresentativeDashboardActivity {
  recent_requests: {
    public_id: string;
    store_name_ar: string;
    status: StoreRequestStatus;
    status_label_ar: string;
    submitted_at: string | null;
    created_at: string;
  }[];
  recent_commissions: {
    public_id: string;
    amount: number;
    currency: string;
    status: CommissionStatus;
    earned_at: string;
  }[];
  recent_receipts: {
    public_id: string;
    receipt_number: string;
    amount: number;
    currency: string;
    status: CollectionReceiptStatus;
    collected_at: string;
  }[];
}

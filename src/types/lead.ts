export type LeadStatus =
  | "draft"
  | "pending_review"
  | "published"
  | "reserved"
  | "accepted"
  | "unavailable"
  | "rejected"
  | "closed";

export type PaymentMethodType = "wallet" | "lead_credit" | "direct_payment" | "non_commercial";

export interface MarketplaceLeadPreview {
  id: string;
  lead_id: string;
  category: string;
  urgency: string;
  state_name: string;
  city_name: string;
  anonymized_summary: string;
  price_paise: number;
  price_inr: number;
  tax_percentage: string | number;
  status: LeadStatus;
  is_exclusive: boolean;
  published_at?: string;
  created_at: string;
}

export interface DetailedLead extends MarketplaceLeadPreview {
  full_description?: string;
  client_name?: string | null;
  client_email?: string | null;
  client_mobile?: string | null;
  client_preferred_contact?: string | null;
  legal_case_id?: string | null;
  acceptance_info?: {
    accepted_at: string;
    payment_method: PaymentMethodType;
    receipt_reference: string;
    professional_email: string;
    status: string;
  } | null;
}

export interface ProfessionalWalletData {
  id: string;
  professional_email: string;
  currency: string;
  balance_paise: number;
  available_inr: number;
  reserved_paise: number;
  reserved_inr: number;
  total_added_paise: number;
  total_added_inr: number;
  total_spent_paise: number;
  total_spent_inr: number;
  available_lead_credits?: number;
  updated_at: string;
}

export interface WalletTransactionItem {
  id: string;
  reference: string;
  tx_type: "credit" | "debit" | "refund" | "adjustment" | "hold" | "hold_release";
  amount_paise: number;
  amount_inr: number;
  balance_after_paise: number;
  balance_after_inr: number;
  description: string;
  created_at: string;
}

export interface LeadCreditPlanItem {
  id: string;
  name: string;
  code: string;
  price_paise: number;
  price_inr: number;
  credits_granted: number;
  validity_days: number;
  description: string;
  is_active: boolean;
  display_order: number;
}

export interface LeadCommercialSettingsData {
  id: string;
  paid_unlock_enabled: boolean;
  default_lead_price_paise: number;
  tax_percentage: number | string;
  reservation_timeout_minutes: number;
  allow_wallet_payment: boolean;
  allow_lead_credit_payment: boolean;
  allow_direct_payment: boolean;
  compliance_notice: string;
  updated_at: string;
}

export interface LeadReportsData {
  total_leads: number;
  published_leads: number;
  accepted_leads: number;
  pending_review: number;
  conversion_rate_percent: number;
  total_revenue_inr: number;
  total_wallet_balance_inr: number;
  total_wallet_topups_inr: number;
}

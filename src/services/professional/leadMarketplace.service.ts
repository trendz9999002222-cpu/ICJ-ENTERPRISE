import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  MarketplaceLeadPreview,
  DetailedLead,
  ProfessionalWalletData,
  WalletTransactionItem,
  LeadCreditPlanItem,
  PaymentMethodType,
} from "@/types/lead";

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
};

type PaginatedResponse<T> = {
  count: number;
  results: T[];
  next: string | null;
  previous: string | null;
  meta?: any;
};

export const leadMarketplaceService = {
  /** List leads in marketplace with filters */
  listMarketplaceLeads: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    category?: string;
    urgency?: string;
    state?: string;
    district?: string;
    availability?: "available" | "taken" | "all";
  } = {}): Promise<{ results: MarketplaceLeadPreview[]; count: number; meta?: any }> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);
    if (params.category && params.category !== "all") q.set("category", params.category);
    if (params.urgency && params.urgency !== "all") q.set("urgency", params.urgency);
    if (params.state && params.state !== "all") q.set("state", params.state);
    if (params.district) q.set("district", params.district);
    if (params.availability) q.set("availability", params.availability);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.professionalLeads.marketplace}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<MarketplaceLeadPreview>>>(path, {
      headers: authHeaders(),
    });
    return {
      results: res.data?.results || [],
      count: res.data?.count || 0,
      meta: (res as any).meta || (res.data as any).meta,
    };
  },

  /** Get single lead details */
  getLeadDetail: async (id: string): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.professionalLeads.leadDetail(id), {
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Reserve lead for checkout */
  reserveLead: async (id: string): Promise<{ reservation_id: string; expires_at: string; lead_id: string }> => {
    const res = await apiClient<ApiEnvelope<{ reservation_id: string; expires_at: string; lead_id: string }>>(
      API_ENDPOINTS.professionalLeads.reserve(id),
      {
        method: "POST",
        headers: authHeaders(),
      }
    );
    return res.data;
  },

  /** Accept lead */
  acceptLead: async (
    id: string,
    paymentMethod: PaymentMethodType = "wallet"
  ): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.professionalLeads.accept(id), {
      method: "POST",
      headers: authHeaders(),
      body: { payment_method: paymentMethod },
    });
    return res.data;
  },

  /** Release lead */
  releaseLead: async (id: string, reason: string): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.professionalLeads.release(id), {
      method: "POST",
      headers: authHeaders(),
      body: { reason },
    });
    return res.data;
  },

  /** Request refund */
  requestRefund: async (id: string, reason: string): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.professionalLeads.refundRequest(id), {
      method: "POST",
      headers: authHeaders(),
      body: { reason },
    });
    return res.data;
  },

  /** Get my accepted leads */
  getMyLeads: async (params: { page?: number; page_size?: number; search?: string } = {}): Promise<{ results: DetailedLead[]; count: number }> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.professionalLeads.myLeads}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<DetailedLead>>>(path, {
      headers: authHeaders(),
    });
    return {
      results: res.data?.results || [],
      count: res.data?.count || 0,
    };
  },

  /** Get wallet info */
  getWallet: async (): Promise<ProfessionalWalletData> => {
    const res = await apiClient<ApiEnvelope<ProfessionalWalletData>>(API_ENDPOINTS.professionalLeads.wallet, {
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Get wallet transactions */
  getWalletTransactions: async (params: { page?: number; page_size?: number; type?: string } = {}): Promise<{ results: WalletTransactionItem[]; count: number }> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.type && params.type !== "all") q.set("type", params.type);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.professionalLeads.walletTransactions}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<WalletTransactionItem>>>(path, {
      headers: authHeaders(),
    });
    return {
      results: res.data?.results || [],
      count: res.data?.count || 0,
    };
  },

  /** Create wallet top-up order */
  createTopupOrder: async (amountInr: number): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.professionalLeads.walletTopupOrder, {
      method: "POST",
      headers: authHeaders(),
      body: { amount_inr: amountInr },
    });
    return res.data;
  },

  /** List lead credit plans */
  getLeadPlans: async (): Promise<{ plans: LeadCreditPlanItem[]; available_lead_credits: number }> => {
    const res = await apiClient<ApiEnvelope<{ plans: LeadCreditPlanItem[]; available_lead_credits: number }>>(
      API_ENDPOINTS.professionalLeads.plans,
      {
        headers: authHeaders(),
      }
    );
    return res.data;
  },

  /** Purchase plan */
  purchasePlan: async (planId: string, payWithWallet: boolean = false): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.professionalLeads.purchasePlan(planId), {
      method: "POST",
      headers: authHeaders(),
      body: { pay_with_wallet: payWithWallet },
    });
    return res.data;
  },

  /** List payment orders */
  getPayments: async (params: { page?: number; page_size?: number } = {}): Promise<any> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));

    const qs = q.toString();
    const path = `${API_ENDPOINTS.professionalLeads.payments}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<any>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Verify direct payment */
  verifyPayment: async (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature?: string }): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.professionalLeads.verifyPayment, {
      method: "POST",
      headers: authHeaders(),
      body: data,
    });
    return res.data;
  },
};

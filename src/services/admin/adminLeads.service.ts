import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  DetailedLead,
  LeadCommercialSettingsData,
  LeadCreditPlanItem,
  LeadReportsData,
  ProfessionalWalletData,
  WalletTransactionItem,
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
};

type PaginatedResponse<T> = {
  count: number;
  results: T[];
  next: string | null;
  previous: string | null;
};

export const adminLeadsService = {
  /** List all leads with filters */
  listLeads: async (params: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    category?: string;
  } = {}): Promise<{ results: DetailedLead[]; count: number }> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);
    if (params.status && params.status !== "all") q.set("status", params.status);
    if (params.category && params.category !== "all") q.set("category", params.category);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.adminLeads.leads}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<DetailedLead>>>(path, {
      headers: authHeaders(),
    });
    return {
      results: res.data?.results || [],
      count: res.data?.count || 0,
    };
  },

  getLeadDetail: async (id: string): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.leadDetail(id), {
      headers: authHeaders(),
    });
    return res.data;
  },

  publishLead: async (id: string, notes: string = ""): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.publish(id), {
      method: "POST",
      headers: authHeaders(),
      body: { notes },
    });
    return res.data;
  },

  unpublishLead: async (id: string, notes: string = ""): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.unpublish(id), {
      method: "POST",
      headers: authHeaders(),
      body: { notes },
    });
    return res.data;
  },

  createLead: async (payload: {
    client_name: string;
    client_mobile?: string;
    client_email?: string;
    category: string;
    urgency: string;
    state_name: string;
    city_name: string;
    problem_description: string;
    anonymized_summary?: string;
    tokens_required?: number;
    status?: string;
  }): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.leads, {
      method: "POST",
      headers: authHeaders(),
      body: payload,
    });
    return res.data;
  },

  reassignLead: async (
    id: string,
    payload: {
      new_professional_id?: string;
      refund_previous: boolean;
      handover_notes: string;
      return_to_marketplace: boolean;
    }
  ): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.reassign(id), {
      method: "POST",
      headers: authHeaders(),
      body: payload,
    });
    return res.data;
  },

  updateCaseProgress: async (
    id: string,
    payload: {
      case_stage?: string;
      case_notes?: string;
    }
  ): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.caseProgress(id), {
      method: "PATCH",
      headers: authHeaders(),
      body: payload,
    });
    return res.data;
  },

  updatePricing: async (id: string, pricePaise: number, taxPercentage?: number): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.pricing(id), {
      method: "PATCH",
      headers: authHeaders(),
      body: { price_paise: pricePaise, tax_percentage: taxPercentage },
    });
    return res.data;
  },

  createLead: async (payload: {
    client_name: string;
    client_mobile?: string;
    client_email?: string;
    preferred_contact?: string;
    state_name?: string;
    city_name?: string;
    category?: string;
    urgency?: string;
    problem_description?: string;
    anonymized_summary?: string;
    tokens_required?: number;
    status?: string;
  }): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.leads, {
      method: "POST",
      headers: authHeaders(),
      body: payload,
    });
    return res.data;
  },

  reassignLead: async (
    id: string,
    payload: {
      new_professional_id?: string;
      refund_previous?: boolean;
      handover_notes?: string;
      return_to_marketplace?: boolean;
    }
  ): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.reassign(id), {
      method: "POST",
      headers: authHeaders(),
      body: payload,
    });
    return res.data;
  },

  updateCaseProgress: async (
    id: string,
    payload: {
      case_stage?: string;
      case_notes?: string;
    }
  ): Promise<DetailedLead> => {
    const res = await apiClient<ApiEnvelope<DetailedLead>>(API_ENDPOINTS.adminLeads.caseProgress(id), {
      method: "PATCH",
      headers: authHeaders(),
      body: payload,
    });
    return res.data;
  },

  listWallets: async (params: { page?: number; page_size?: number; search?: string } = {}): Promise<{ results: ProfessionalWalletData[]; count: number }> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.adminLeads.wallets}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<ProfessionalWalletData>>>(path, {
      headers: authHeaders(),
    });
    return {
      results: res.data?.results || [],
      count: res.data?.count || 0,
    };
  },

  adjustWallet: async (
    walletId: string,
    optionsOrAmount: number | { amount_inr?: number; tokens_delta?: number; is_credit: boolean; reason: string },
    isCredit?: boolean,
    reason?: string
  ): Promise<any> => {
    const body = typeof optionsOrAmount === "number"
      ? { amount_inr: optionsOrAmount, is_credit: isCredit, reason }
      : optionsOrAmount;
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.adminLeads.adjustWallet(walletId), {
      method: "POST",
      headers: authHeaders(),
      body,
    });
    return res.data;
  },

  listWalletTransactions: async (params: { page?: number; page_size?: number; search?: string; type?: string } = {}): Promise<{ results: WalletTransactionItem[]; count: number }> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);
    if (params.type && params.type !== "all") q.set("type", params.type);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.adminLeads.walletTransactions}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<WalletTransactionItem>>>(path, {
      headers: authHeaders(),
    });
    return {
      results: res.data?.results || [],
      count: res.data?.count || 0,
    };
  },

  listPlans: async (): Promise<LeadCreditPlanItem[]> => {
    const res = await apiClient<ApiEnvelope<LeadCreditPlanItem[]>>(API_ENDPOINTS.adminLeads.plans, {
      headers: authHeaders(),
    });
    return res.data || [];
  },

  createPlan: async (planData: Partial<LeadCreditPlanItem>): Promise<LeadCreditPlanItem> => {
    const res = await apiClient<ApiEnvelope<LeadCreditPlanItem>>(API_ENDPOINTS.adminLeads.plans, {
      method: "POST",
      headers: authHeaders(),
      body: planData,
    });
    return res.data;
  },

  updatePlan: async (id: string, planData: Partial<LeadCreditPlanItem>): Promise<LeadCreditPlanItem> => {
    const res = await apiClient<ApiEnvelope<LeadCreditPlanItem>>(API_ENDPOINTS.adminLeads.planDetail(id), {
      method: "PATCH",
      headers: authHeaders(),
      body: planData,
    });
    return res.data;
  },

  listPayments: async (params: { page?: number; page_size?: number; status?: string; search?: string } = {}): Promise<any> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.status && params.status !== "all") q.set("status", params.status);
    if (params.search) q.set("search", params.search);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.adminLeads.payments}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<any>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  listRefunds: async (params: { page?: number; page_size?: number; status?: string } = {}): Promise<any> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.status && params.status !== "all") q.set("status", params.status);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.adminLeads.refunds}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<any>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  processRefund: async (refundId: string, approve: boolean, notes: string = ""): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.adminLeads.processRefund(refundId), {
      method: "POST",
      headers: authHeaders(),
      body: { approve, notes },
    });
    return res.data;
  },

  getCommercialSettings: async (): Promise<LeadCommercialSettingsData> => {
    const res = await apiClient<ApiEnvelope<LeadCommercialSettingsData>>(API_ENDPOINTS.adminLeads.commercialSettings, {
      headers: authHeaders(),
    });
    return res.data;
  },

  updateCommercialSettings: async (data: Partial<LeadCommercialSettingsData>): Promise<LeadCommercialSettingsData> => {
    const res = await apiClient<ApiEnvelope<LeadCommercialSettingsData>>(API_ENDPOINTS.adminLeads.commercialSettings, {
      method: "PATCH",
      headers: authHeaders(),
      body: data,
    });
    return res.data;
  },

  getReports: async (): Promise<LeadReportsData> => {
    const res = await apiClient<ApiEnvelope<LeadReportsData>>(API_ENDPOINTS.adminLeads.reports, {
      headers: authHeaders(),
    });
    return res.data;
  },
};

import { env } from "@/config/env";
import { authenticatedFetch } from "@/lib/api/authFetch";

export interface DonationInitiatePayload {
  amount: number;
  fund_category: string;
  donor_name?: string;
  donor_email?: string;
  donor_phone?: string;
  donor_pan?: string;
  donor_address?: string;
  donor_state?: string;
  donor_pincode?: string;
  is_anonymous?: boolean;
  notes?: string;
}

export interface DonationVerifyPayload {
  txnid: string;
  status?: string;
  easepayid?: string;
  hash?: string;
  mode?: string;
  bank_ref_num?: string;
}

export interface UserDonationItem {
  id: string;
  receipt_number: string | null;
  amount: string | number;
  currency: string;
  fund_category: string;
  fund_category_display: string;
  is_anonymous: boolean;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "REFUNDED";
  payment_mode: string;
  donor_pan: string;
  easebuzz_txnid: string;
  created_at: string;
  receipt_url: string | null;
  notes: string;
}

export interface UserDonationStats {
  total_contributed: number;
  donations_count: number;
  tax_exemptions_count: number;
}

export interface OfficialReceiptData {
  receipt_number: string;
  date: string;
  financial_year: string;
  status: string;
  amount: number;
  amount_formatted: string;
  amount_in_words: string;
  donor: {
    name: string;
    email: string;
    phone: string;
    pan: string;
    address: string;
    state: string;
    pincode: string;
  };
  purpose: {
    code: string;
    label: string;
    notes: string;
  };
  payment: {
    gateway: string;
    transaction_id: string;
    payment_id: string;
    mode: string;
    bank_ref: string;
  };
  trust: {
    name: string;
    registration_no: string;
    pan: string;
    "80g_reg_no": string;
    "80g_validity": string;
    office_address: string;
    email: string;
    phone: string;
  };
  is_80g_eligible: boolean;
  verification_url: string;
}

export interface AdminDonationItem {
  id: string;
  receipt_number: string | null;
  donor_name: string;
  donor_email: string;
  donor_phone: string;
  donor_pan: string;
  donor_address: string;
  donor_state: string;
  donor_pincode: string;
  amount: string | number;
  currency: string;
  fund_category: string;
  fund_category_display: string;
  is_anonymous: boolean;
  notes: string;
  gateway: string;
  easebuzz_txnid: string;
  easebuzz_payment_id: string;
  payment_mode: string;
  bank_ref_num: string;
  status: "INITIATED" | "SUCCESS" | "FAILED" | "REFUNDED";
  is_80g_eligible: boolean;
  created_at: string;
  updated_at: string;
  user_info: {
    id: string;
    email: string;
    name: string;
    roles: string[];
  } | null;
}

export interface AdminDonationStats {
  total_raised: number;
  total_donations: number;
  month_raised: number;
  month_count: number;
  unique_donors: number;
  total_80g_certificates: number;
  total_80g_amount: number;
  category_breakdown: {
    code: string;
    label: string;
    amount: number;
  }[];
}

/**
 * Safe fetch wrapper that guards against HTML responses (e.g. 404, 500, or redirects)
 * so it will NEVER throw "Unexpected token '<', '<!DOCTYPE '... is not valid JSON".
 */
async function safeJsonFetch<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await authenticatedFetch(url, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    const text = await res.text().catch(() => "");
    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("Authentication session expired. Please sign in again.");
      }
      if (res.status === 403) {
        throw new Error("Permission denied for this action.");
      }
      if (res.status === 404) {
        throw new Error("Resource not found. Please confirm the backend server is running.");
      }
      throw new Error(`Server returned status ${res.status}`);
    }
    throw new Error("Received unexpected non-JSON response from server.");
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || json.detail || "Request failed");
  }
  return json as T;
}

export const donationService = {
  /**
   * Initiate a new trust donation.
   */
  async initiateDonation(payload: DonationInitiatePayload) {
    const json = await safeJsonFetch<{ data: any }>(`${env.apiUrl}/donations/initiate/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  /**
   * Verify Easebuzz response after donor completes transaction.
   */
  async verifyDonation(payload: DonationVerifyPayload) {
    const json = await safeJsonFetch<{ data: any }>(`${env.apiUrl}/donations/verify/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json.data;
  },

  /**
   * Fetch logged-in user's past donations & summary stats.
   */
  async fetchMyDonations(params: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    fund?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.page_size) query.set("page_size", String(params.page_size));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.fund) query.set("fund", params.fund);

    const qs = query.toString();
    const url = `${env.apiUrl}/donations/my-donations/${qs ? `?${qs}` : ""}`;

    const json = await safeJsonFetch<any>(url);
    return {
      results: (json.data?.results || json.results || []) as UserDonationItem[],
      count: json.data?.count || json.count || 0,
      stats: (json.stats || json.data?.stats || {
        total_contributed: 0,
        donations_count: 0,
        tax_exemptions_count: 0,
      }) as UserDonationStats,
    };
  },

  /**
   * Fetch official printable receipt data by donation ID.
   */
  async fetchReceipt(donationId: string): Promise<OfficialReceiptData> {
    const json = await safeJsonFetch<{ data: OfficialReceiptData }>(`${env.apiUrl}/donations/${donationId}/receipt/`);
    return json.data;
  },

  // --------------------------------------------------------------------------
  // Admin Endpoints
  // --------------------------------------------------------------------------

  /**
   * Fetch all donations across the system with filtering.
   */
  async fetchAdminDonations(params: {
    page?: number;
    page_size?: number;
    search?: string;
    status?: string;
    fund?: string;
    role?: string;
    start_date?: string;
    end_date?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.page_size) query.set("page_size", String(params.page_size));
    if (params.search) query.set("search", params.search);
    if (params.status) query.set("status", params.status);
    if (params.fund) query.set("fund", params.fund);
    if (params.role) query.set("role", params.role);
    if (params.start_date) query.set("start_date", params.start_date);
    if (params.end_date) query.set("end_date", params.end_date);

    const qs = query.toString();
    const url = `${env.apiUrl}/admin/donations/${qs ? `?${qs}` : ""}`;

    const json = await safeJsonFetch<any>(url);
    return {
      results: (json.data?.results || json.results || []) as AdminDonationItem[],
      count: json.data?.count || json.count || 0,
    };
  },

  /**
   * Fetch admin summary KPI stats.
   */
  async fetchAdminStats(): Promise<AdminDonationStats> {
    const json = await safeJsonFetch<{ data: AdminDonationStats }>(`${env.apiUrl}/admin/donations/stats/`);
    return json.data;
  },

  /**
   * Fetch detailed audit information for an admin.
   */
  async fetchAdminDonationDetail(donationId: string) {
    const json = await safeJsonFetch<{ data: any }>(`${env.apiUrl}/admin/donations/${donationId}/`);
    return json.data as {
      donation: AdminDonationItem;
      receipt: OfficialReceiptData;
      raw_response: any;
    };
  },

  /**
   * Generate CSV download URL.
   */
  getExportCsvUrl(params: { status?: string; fund?: string } = {}) {
    const query = new URLSearchParams();
    if (params.status) query.set("status", params.status);
    if (params.fund) query.set("fund", params.fund);
    const qs = query.toString();
    return `${env.apiUrl}/admin/donations/export/${qs ? `?${qs}` : ""}`;
  },
};

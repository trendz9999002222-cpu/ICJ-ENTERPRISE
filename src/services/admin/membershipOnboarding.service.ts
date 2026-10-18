import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

const BASE = "/admin/membership-onboarding";

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(path: string, init?: { method?: string; body?: unknown }): Promise<T> {
  const res = await apiClient<ApiEnvelope<T>>(path, {
    method: init?.method,
    body: init?.body,
    headers: authHeaders(),
  });
  return res.data;
}

export type MembershipTypeAdmin = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
};

export type MembershipFormAdmin = {
  id: string;
  membership_type: string;
  version: number;
  is_active: boolean;
  title: string;
};

export type MembershipStepAdmin = {
  id: string;
  form: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  display_order: number;
  is_active: boolean;
  is_required: boolean;
};

export type MembershipStepFieldAdmin = {
  id: string;
  step: string;
  name: string;
  label: string;
  field_key: string;
  field_type: string;
  is_required: boolean;
  display_order: number;
  is_active: boolean;
  placeholder?: string;
  help_text?: string;
};

export type AdminMembershipApplication = {
  id: string;
  reference_id: string;
  membership_id?: string | null;
  person_name: string;
  email: string;
  mobile: string;
  membership_type_name: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
};

export type AdminMembershipApplicationDetail = AdminMembershipApplication & {
  field_values: Record<string, unknown>;
  declaration_accepted: boolean;
  declaration_date: string | null;
  rejection_reason: string;
  documents: Array<{
    document_key: string;
    document_type: string;
    original_name: string;
    verification_status: string;
    url: string | null;
  }>;
  history: Array<{ action: string; created_at: string; metadata: Record<string, unknown> }>;
};

export const membershipOnboardingAdminService = {
  async listApplications(params?: { search?: string; status?: string; page?: number; page_size?: number }) {
    const qs = new URLSearchParams();
    if (params?.search) qs.set("search", params.search);
    if (params?.status) qs.set("status", params.status);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.page_size) qs.set("page_size", String(params.page_size));
    const path = `${BASE}/applications/${qs.toString() ? `?${qs}` : ""}`;
    return request<{
      results: AdminMembershipApplication[];
      count: number;
      next: string | null;
      previous: string | null;
    }>(path);
  },

  async getApplication(id: string) {
    return request<AdminMembershipApplicationDetail>(`${BASE}/applications/${id}/`);
  },

  async reviewApplication(id: string) {
    await request(`${BASE}/applications/${id}/review/`, { method: "POST" });
  },

  async approveApplication(id: string) {
    return request<Record<string, unknown>>(`${BASE}/applications/${id}/approve/`, { method: "POST" });
  },

  async rejectApplication(id: string, rejectionReason: string) {
    await request(`${BASE}/applications/${id}/reject/`, {
      method: "POST",
      body: JSON.stringify({ rejection_reason: rejectionReason }),
    });
  },

  async listTypes() {
    const data = await request<{ results: MembershipTypeAdmin[] }>(`${BASE}/types/`);
    return data.results;
  },

  async createType(payload: Partial<MembershipTypeAdmin>) {
    return request<MembershipTypeAdmin>(`${BASE}/types/`, { method: "POST", body: payload });
  },

  async updateType(id: string, payload: Partial<MembershipTypeAdmin>) {
    return request<MembershipTypeAdmin>(`${BASE}/types/${id}/`, { method: "PATCH", body: payload });
  },

  async listForms(membershipTypeId?: string) {
    const qs = membershipTypeId ? `?membership_type_id=${membershipTypeId}` : "";
    const data = await request<{ results: MembershipFormAdmin[] }>(`${BASE}/forms/${qs}`);
    return data.results;
  },

  async createForm(payload: { title: string; is_active?: boolean }) {
    return request<MembershipFormAdmin>(`${BASE}/forms/`, { method: "POST", body: payload });
  },

  async updateForm(id: string, payload: Partial<MembershipFormAdmin>) {
    return request<MembershipFormAdmin>(`${BASE}/forms/${id}/`, { method: "PATCH", body: payload });
  },

  async listSteps(formId: string) {
    const data = await request<{ results: MembershipStepAdmin[] }>(`${BASE}/forms/${formId}/steps/`);
    return data.results;
  },

  async createStep(formId: string, payload: Partial<MembershipStepAdmin>) {
    return request<MembershipStepAdmin>(`${BASE}/forms/${formId}/steps/`, { method: "POST", body: payload });
  },

  async updateStep(id: string, payload: Partial<MembershipStepAdmin>) {
    return request<MembershipStepAdmin>(`${BASE}/steps/${id}/`, { method: "PATCH", body: payload });
  },

  async listStepFields(stepId: string) {
    const data = await request<{ results: MembershipStepFieldAdmin[] }>(`${BASE}/steps/${stepId}/fields/`);
    return data.results;
  },

  async createStepField(stepId: string, payload: Partial<MembershipStepFieldAdmin>) {
    return request<MembershipStepFieldAdmin>(`${BASE}/steps/${stepId}/fields/`, { method: "POST", body: payload });
  },

  async updateStepField(id: string, payload: Partial<MembershipStepFieldAdmin>) {
    return request<MembershipStepFieldAdmin>(`${BASE}/step-fields/${id}/`, { method: "PATCH", body: payload });
  },

  async getPaymentSettings() {
    return request<{
      amount_paise: number;
      amount_inr: number;
      currency: string;
      is_payment_enabled: boolean;
      updated_at: string | null;
      payment_gateway?: string;
      easebuzz_configured?: boolean;
      easebuzz_key?: string;
      easebuzz_env?: string;
      razorpay_configured?: boolean;
      razorpay_key_id?: string;
    }>(`${BASE}/payment-settings/`);
  },

  async updatePaymentSettings(payload: { amount_inr?: number; is_payment_enabled?: boolean }) {
    return request<{
      amount_paise: number;
      amount_inr: number;
      currency: string;
      is_payment_enabled: boolean;
      updated_at: string;
    }>(`${BASE}/payment-settings/`, { method: "PATCH", body: payload });
  },

  async listPayments(params?: { page?: number; page_size?: number; status?: string; search?: string }) {
    const q = new URLSearchParams();
    if (params?.page) q.set("page", String(params.page));
    if (params?.page_size) q.set("page_size", String(params.page_size));
    if (params?.status && params.status !== "all") q.set("status", params.status);
    if (params?.search) q.set("search", params.search);
    const qs = q.toString() ? `?${q.toString()}` : "";
    return request<{ count: number; results: any[] }>(`${BASE}/payments/${qs}`);
  },
};

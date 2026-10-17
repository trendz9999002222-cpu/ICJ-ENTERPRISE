import { apiClient, apiClientFormData } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { MembershipOnboardingConfiguration } from "@/types/public/membershipOnboarding";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const BASE = "/membership-onboarding";

export type MembershipPaymentSettings = {
  payment_required: boolean;
  is_payment_enabled: boolean;
  amount_paise: number;
  amount_inr: number;
  currency: string;
  payment_gateway?: string;
  easebuzz_configured?: boolean;
  easebuzz_key?: string;
  easebuzz_env?: string;
  razorpay_key_id?: string;
};

export type MembershipCreateOrderResponse = {
  payment_id: string;
  gateway?: string;
  access_key: string;
  txnid: string;
  amount_paise: number;
  amount_inr?: number;
  currency: string;
  key?: string;
  env?: string;
  payment_url?: string;
  // Razorpay backward compatibility
  razorpay_order_id?: string;
  razorpay_key_id?: string;
};

export const membershipOnboardingPublicService = {
  async fetchPaymentSettings(): Promise<MembershipPaymentSettings> {
    return (await apiClient<ApiEnvelope<MembershipPaymentSettings>>(`${BASE}/payment/settings/`)).data;
  },

  async createPaymentOrder(payload: {
    name?: string;
    email?: string;
    phone?: string;
    application_id?: string;
  } = {}): Promise<MembershipCreateOrderResponse> {
    return (
      await apiClient<ApiEnvelope<MembershipCreateOrderResponse>>(`${BASE}/payment/create-order/`, {
        method: "POST",
        body: payload,
      })
    ).data;
  },

  async verifyPayment(payload: {
    payment_id: string;
    txnid?: string;
    status?: string;
    easepayid?: string;
    hash?: string;
    // Razorpay backward compatibility
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    application_id?: string;
  }): Promise<{ payment_id: string; verified: boolean }> {
    return (
      await apiClient<ApiEnvelope<{ payment_id: string; verified: boolean }>>(`${BASE}/payment/verify/`, {
        method: "POST",
        body: payload,
      })
    ).data;
  },

  async validateIdentity(payload: {
    email?: string;
    phone?: string;
  }): Promise<{ valid: boolean }> {
    const res = await apiClient<ApiEnvelope<{ valid: boolean }>>(`${BASE}/validate-identity/`, {
      method: "POST",
      body: payload,
    });
    return res.data ?? { valid: true };
  },

  async fetchConfiguration(): Promise<MembershipOnboardingConfiguration> {
    const path = API_ENDPOINTS.membershipOnboardingPublic.configuration;
    return (await apiClient<ApiEnvelope<MembershipOnboardingConfiguration>>(path)).data;
  },

  async submitApplication(payload: {
    fieldValues: Record<string, unknown>;
    files: Record<string, File | null>;
    declarationAccepted: boolean;
    idempotencyKey?: string;
    paymentId?: string;
  }): Promise<{
    referenceId: string;
    status: string;
    access?: string;
    refresh?: string;
    requires_password_change?: boolean;
    user?: {
      id: number;
      email: string;
      is_new_user?: boolean;
      temp_password?: string | null;
      password_change_required?: boolean;
    };
  }> {
    const formData = new FormData();
    formData.set("field_values", JSON.stringify(payload.fieldValues));
    formData.set("declaration_accepted", payload.declarationAccepted ? "true" : "false");

    Object.entries(payload.files).forEach(([documentKey, file]) => {
      if (file) formData.append(`document__${documentKey}`, file);
    });

    if (payload.idempotencyKey) {
      formData.set("idempotency_key", payload.idempotencyKey);
    }
    if (payload.paymentId) {
      formData.set("payment_id", payload.paymentId);
    }

    const { readAccessTokenFromCookie } = await import("@/lib/api/client");
    const token = readAccessTokenFromCookie();
    const headers: Record<string, string> = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await apiClientFormData<
      ApiEnvelope<{
        reference_id: string;
        status: string;
        submitted_at?: string;
        user?: Record<string, unknown>;
      }> & {
        access?: string;
        refresh?: string;
        requires_password_change?: boolean;
      }
    >(`${BASE}/register/`, { method: "POST", formData, headers });

    return {
      referenceId: res.data.reference_id,
      status: res.data.status,
      access: res.access,
      refresh: res.refresh,
      requires_password_change: res.requires_password_change,
      user: res.data.user as {
        id: number;
        email: string;
        is_new_user?: boolean;
        temp_password?: string | null;
        password_change_required?: boolean;
      },
    };
  },
};

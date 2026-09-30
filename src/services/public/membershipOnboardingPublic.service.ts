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
  razorpay_key_id: string;
};

export type MembershipCreateOrderResponse = {
  payment_id: string;
  razorpay_order_id: string;
  amount_paise: number;
  currency: string;
  razorpay_key_id: string;
};

export const membershipOnboardingPublicService = {
  async fetchPaymentSettings(): Promise<MembershipPaymentSettings> {
    return (await apiClient<ApiEnvelope<MembershipPaymentSettings>>(`${BASE}/payment/settings/`)).data;
  },

  async createPaymentOrder(): Promise<MembershipCreateOrderResponse> {
    return (
      await apiClient<ApiEnvelope<MembershipCreateOrderResponse>>(`${BASE}/payment/create-order/`, {
        method: "POST",
        body: {},
      })
    ).data;
  },

  async verifyPayment(payload: {
    payment_id: string;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<{ payment_id: string; verified: boolean }> {
    return (
      await apiClient<ApiEnvelope<{ payment_id: string; verified: boolean }>>(`${BASE}/payment/verify/`, {
        method: "POST",
        body: payload,
      })
    ).data;
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
    >(`${BASE}/register/`, { method: "POST", formData });

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

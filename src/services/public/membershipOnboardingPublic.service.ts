import { apiClient, apiClientFormData } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { MembershipOnboardingConfiguration } from "@/types/public/membershipOnboarding";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const BASE = "/membership-onboarding";

export const membershipOnboardingPublicService = {
  async fetchConfiguration(): Promise<MembershipOnboardingConfiguration> {
    const path = API_ENDPOINTS.membershipOnboardingPublic.configuration;
    return (await apiClient<ApiEnvelope<MembershipOnboardingConfiguration>>(path)).data;
  },

  async submitApplication(payload: {
    fieldValues: Record<string, unknown>;
    files: Record<string, File | null>;
    declarationAccepted: boolean;
    idempotencyKey?: string;
  }): Promise<{ referenceId: string; status: string }> {
    const formData = new FormData();
    formData.set("field_values", JSON.stringify(payload.fieldValues));
    formData.set("declaration_accepted", payload.declarationAccepted ? "true" : "false");

    Object.entries(payload.files).forEach(([documentKey, file]) => {
      if (file) formData.append(`document__${documentKey}`, file);
    });

    if (payload.idempotencyKey) {
      formData.set("idempotency_key", payload.idempotencyKey);
    }

    const res = await apiClientFormData<
      ApiEnvelope<{ reference_id: string; status: string; submitted_at?: string }>
    >(`${BASE}/register/`, { method: "POST", formData });

    return { referenceId: res.data.reference_id, status: res.data.status };
  },
};

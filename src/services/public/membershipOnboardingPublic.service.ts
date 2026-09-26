import { apiClient, apiClientFormData } from "@/lib/api/client";
import type {
  MembershipOnboardingConfiguration,
  MembershipTypePublic,
} from "@/types/public/membershipOnboarding";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const BASE = "/membership-onboarding";

export const membershipOnboardingPublicService = {
  async fetchTypes(): Promise<MembershipTypePublic[]> {
    const res = await apiClient<ApiEnvelope<{ results: MembershipTypePublic[] }>>(`${BASE}/types/`);
    return res.data.results;
  },

  async fetchConfiguration(membershipTypeId: string): Promise<MembershipOnboardingConfiguration> {
    return (
      await apiClient<ApiEnvelope<MembershipOnboardingConfiguration>>(
        `${BASE}/types/${membershipTypeId}/configuration/`,
      )
    ).data;
  },

  async submitApplication(payload: {
    membershipTypeId: string;
    fieldValues: Record<string, unknown>;
    files: Record<string, File | null>;
    declarationAccepted: boolean;
    idempotencyKey?: string;
  }): Promise<{ referenceId: string; status: string }> {
    const formData = new FormData();
    formData.set("membership_type_id", payload.membershipTypeId);
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

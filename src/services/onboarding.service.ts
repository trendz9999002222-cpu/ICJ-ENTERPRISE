import {
  apiClient,
  apiClientFormData,
  readAccessTokenFromCookie,
} from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { OnboardingFormState } from "@/types/onboarding-form";

export type AdvocateSubmitResponse = {
  success: boolean;
  message: string;
  data: {
    reference_id: string;
    status: string;
    submitted_at: string;
  };
};

export type AdvocateApplicationSummary = {
  id: string;
  reference_id: string;
  email: string;
  status: string;
  full_name: string;
  mobile: string;
  bar_number: string;
  created_at: string;
  reviewed_at: string | null;
};

export type AdvocateApplicationDocument = {
  id: string;
  doc_key: string;
  original_name: string;
  file_url: string | null;
};

export type AdvocateApplicationDetail = AdvocateApplicationSummary & {
  personal_data: Record<string, unknown>;
  address_data: Record<string, unknown>;
  advocate_data: Record<string, unknown>;
  rejection_reason: string;
  reviewed_by_email: string | null;
  updated_at: string;
  documents: AdvocateApplicationDocument[];
};

type ApiListResponse = {
  success: boolean;
  message: string;
  data: {
    results: AdvocateApplicationSummary[];
    count: number;
    next: string | null;
    previous: string | null;
  };
};

type ApiDetailResponse = {
  success: boolean;
  message: string;
  data: AdvocateApplicationDetail;
};

const ADVOCATE_DOC_KEYS = ["resumeDoc", "coverLetterDoc", "barLicenseDoc", "govtPhotoIdDoc"] as const;

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return { Authorization: `Bearer ${token}` };
}

export const onboardingService = {
  submitAdvocateApplication: async (formState: OnboardingFormState) => {
    const formData = new FormData();
    formData.append(
      "payload",
      JSON.stringify({
        personal: formState.personal,
        address: formState.address,
        advocate: formState.advocate,
      }),
    );

    for (const key of ADVOCATE_DOC_KEYS) {
      const doc = formState.documents[key];
      if (!doc?.file) {
        throw new Error(`Missing file for ${key}`);
      }
      formData.append(key, doc.file, doc.fileName);
    }

    return apiClientFormData<AdvocateSubmitResponse>(API_ENDPOINTS.onboarding.advocateSubmit, {
      method: "POST",
      formData,
    });
  },

  listAdvocateApplications: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set("status", params.status);
    if (params?.search) query.set("search", params.search);
    const qs = query.toString();
    const path = `${API_ENDPOINTS.onboarding.adminAdvocates}${qs ? `?${qs}` : ""}`;
    return apiClient<ApiListResponse>(path, {
      headers: authHeaders(),
    });
  },

  getAdvocateApplication: (id: string) =>
    apiClient<ApiDetailResponse>(API_ENDPOINTS.onboarding.adminAdvocateDetail(id), {
      headers: authHeaders(),
    }),

  approveAdvocateApplication: (id: string) =>
    apiClient<ApiDetailResponse>(API_ENDPOINTS.onboarding.adminAdvocateApprove(id), {
      method: "POST",
      headers: authHeaders(),
      body: {},
    }),

  rejectAdvocateApplication: (id: string, reason?: string) =>
    apiClient<ApiDetailResponse>(API_ENDPOINTS.onboarding.adminAdvocateReject(id), {
      method: "POST",
      headers: authHeaders(),
      body: { reason: reason ?? "" },
    }),
};

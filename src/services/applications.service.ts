import { apiClient } from "@/lib/api/client";

export interface ApplicationSubmitPayload {
  pathway: "legal_professional" | "other_professional" | "volunteer";
  category: string;
  personal_data: Record<string, unknown>;
  professional_data: Record<string, unknown>;
  category_data: Record<string, unknown>;
  declaration_accepted: boolean;
}

export interface ApplicationStatus {
  id: string;
  reference_number: string;
  pathway: string;
  category: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "info_requested";
  submitted_at: string;
  reviewed_at?: string;
  reviewer_notes?: string;
}

export interface ApplicationSubmitResponse {
  reference_number: string;
  status: string;
  submitted_at: string;
}

export const ApplicationsService = {
  submit: async (data: ApplicationSubmitPayload): Promise<ApplicationSubmitResponse> => {
    return apiClient<ApplicationSubmitResponse>("/applications/submit/", {
      method: "POST",
      body: data,
    });
  },

  myStatus: async (): Promise<ApplicationStatus[]> => {
    return apiClient<ApplicationStatus[]>("/applications/my-status/", {
      method: "GET",
    });
  },

  detail: async (id: string): Promise<ApplicationStatus> => {
    return apiClient<ApplicationStatus>(`/applications/${id}/`, {
      method: "GET",
    });
  },
};

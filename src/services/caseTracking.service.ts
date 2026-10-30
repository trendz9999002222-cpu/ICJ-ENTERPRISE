import { apiClient } from "@/lib/api/client";

// ─── Initiate ────────────────────────────────────────────────────────────────
// Backend: POST /api/v1/services/cases/track/initiate/
// Expects: { case_id: string, contact: string }   (contact = email OR mobile)
// Returns: { session_id: string, message: string, dev_otp?: string }

export interface CaseTrackingInitiatePayload {
  case_id: string;
  contact: string; // email address or mobile number — backend normalises both
}

export interface CaseTrackingInitiateResponse {
  session_id: string;   // backend key (was incorrectly called session_token)
  message: string;
  dev_otp?: string;     // only present in DEBUG mode — useful for local testing
}

// ─── Verify ──────────────────────────────────────────────────────────────────
// Backend: POST /api/v1/services/cases/track/verify/
// Expects: { case_id: string, session_id: string, otp: string }
// Returns: { track_data: CaseTrackData }

export interface CaseTrackingVerifyPayload {
  case_id: string;
  session_id: string;   // must match what initiate returned
  otp: string;
}

// ─── Result ──────────────────────────────────────────────────────────────────

export interface CaseMilestone {
  title: string;
  description?: string;
  completed: boolean;
  completed_at?: string;
  date?: string;
  status?: string;
}

export interface CaseTrackData {
  case_id: string;
  status: string;
  category?: string;
  matter_type?: string;
  urgency?: string;
  submitted_at?: string;
  submission_date?: string;
  assigned_professional?: string;
  assigned_legal_counsel?: string;
  help_type?: string;
  milestones: CaseMilestone[];
  last_updated?: string;
}

export interface CaseTrackingVerifyResponse {
  track_data: CaseTrackData;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export const CaseTrackingService = {
  initiate: async (data: CaseTrackingInitiatePayload): Promise<CaseTrackingInitiateResponse> => {
    return apiClient<CaseTrackingInitiateResponse>("/services/cases/track/initiate/", {
      method: "POST",
      body: data,
    });
  },

  verify: async (data: CaseTrackingVerifyPayload): Promise<CaseTrackingVerifyResponse> => {
    return apiClient<CaseTrackingVerifyResponse>("/services/cases/track/verify/", {
      method: "POST",
      body: data,
    });
  },
};

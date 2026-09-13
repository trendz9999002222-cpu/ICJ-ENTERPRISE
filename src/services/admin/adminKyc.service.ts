import { mockKycApplications } from "@/data/admin/kyc";
import type {
  AdminKycApplication,
  AdminListParams,
  KycStatus,
  PaginatedResponse,
} from "@/types/admin";

// =============================================================================
// Admin KYC Service
//
// This is the mock-backed version of what was previously called directly from
// AdvocateVerificationPanel via onboardingService.
//
// Future API endpoints (mirrors existing Django endpoints):
//   GET  /api/v1/onboarding/admin/advocates/?status=pending
//   GET  /api/v1/onboarding/admin/advocates/:id/
//   POST /api/v1/onboarding/admin/advocates/:id/approve/
//   POST /api/v1/onboarding/admin/advocates/:id/reject/
// =============================================================================

// In-memory state so approve/reject mutations persist during the session
let _kycStore = [...mockKycApplications];

export const adminKycService = {
  /**
   * List KYC applications with optional filtering.
   * Future: return apiClient<PaginatedResponse<AdminKycApplication>>(`/onboarding/admin/advocates/?${qs}`, { headers: authHeaders() });
   */
  listApplications: async (
    params: AdminListParams & { status?: KycStatus | "all" } = {}
  ): Promise<PaginatedResponse<AdminKycApplication>> => {
    await new Promise((r) => setTimeout(r, 300));

    let results = [..._kycStore];

    if (params.status && params.status !== "all") {
      results = results.filter((a) => a.status === params.status);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(
        (a) =>
          a.reference_id.toLowerCase().includes(q) ||
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.bar_number.toLowerCase().includes(q)
      );
    }

    const page = params.page ?? 1;
    const pageSize = params.page_size ?? 20;
    const start = (page - 1) * pageSize;
    const paged = results.slice(start, start + pageSize);

    return {
      results: paged,
      count: results.length,
      next: start + pageSize < results.length ? "next" : null,
      previous: page > 1 ? "prev" : null,
    };
  },

  /**
   * Get a single KYC application detail.
   * Future: return apiClient<AdminKycApplication>(`/onboarding/admin/advocates/${id}/`, { headers: authHeaders() });
   */
  getApplication: async (id: string): Promise<AdminKycApplication> => {
    await new Promise((r) => setTimeout(r, 200));
    const app = _kycStore.find((a) => a.id === id);
    if (!app) throw new Error(`KYC application ${id} not found`);
    return { ...app };
  },

  /**
   * Approve a KYC application.
   * Future: return apiClient(`/onboarding/admin/advocates/${id}/approve/`, { method: "POST", headers: authHeaders() });
   */
  approveApplication: async (id: string): Promise<AdminKycApplication> => {
    await new Promise((r) => setTimeout(r, 400));
    const idx = _kycStore.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`KYC application ${id} not found`);
    if (_kycStore[idx].status !== "pending") {
      throw new Error("Only pending applications can be approved");
    }
    _kycStore[idx] = {
      ..._kycStore[idx],
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by_email: "admin@icj.law",
      updated_at: new Date().toISOString(),
    };
    return { ..._kycStore[idx] };
  },

  /**
   * Reject a KYC application.
   * Future: return apiClient(`/onboarding/admin/advocates/${id}/reject/`, { method: "POST", body: { reason }, headers: authHeaders() });
   */
  rejectApplication: async (
    id: string,
    reason?: string
  ): Promise<AdminKycApplication> => {
    await new Promise((r) => setTimeout(r, 400));
    const idx = _kycStore.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error(`KYC application ${id} not found`);
    if (_kycStore[idx].status !== "pending") {
      throw new Error("Only pending applications can be rejected");
    }
    _kycStore[idx] = {
      ..._kycStore[idx],
      status: "rejected",
      rejection_reason: reason ?? "",
      reviewed_at: new Date().toISOString(),
      reviewed_by_email: "admin@icj.law",
      updated_at: new Date().toISOString(),
    };
    return { ..._kycStore[idx] };
  },
};

import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { mockAdvocates } from "@/data/admin/advocates";
import type {
  AdminAdvocate,
  AdminAdvocateDetail,
  AdminListParams,
  AdvocateVerificationStatus,
  PaginatedResponse,
} from "@/types/admin";

// =============================================================================
// Admin Advocates Service
//
// PRIMARY source: Django REST API — GET /api/v1/onboarding/admin/advocates/
// Detail endpoint: GET /api/v1/onboarding/admin/advocates/<id>/
// Approve endpoint: POST /api/v1/onboarding/admin/advocates/<id>/approve/
// Reject endpoint: POST /api/v1/onboarding/admin/advocates/<id>/reject/
// FALLBACK: mock data (when API is unreachable / not authenticated)
// =============================================================================

// Django onboarding list response shape
type DjangoAdvocateListResponse = {
  success: boolean;
  message: string;
  data: {
    results: {
      id: string;
      reference_id: string;
      email: string;
      status: string;
      full_name: string;
      mobile: string;
      bar_number: string;
      created_at: string;
      reviewed_at: string | null;
    }[];
    count: number;
    next: string | null;
    previous: string | null;
  };
};

// Django onboarding detail response shape
type DjangoAdvocateDetailResponse = {
  success: boolean;
  message: string;
  data: {
    id: string;
    reference_id: string;
    email: string;
    status: string;
    personal_data?: Record<string, any>;
    address_data?: Record<string, any>;
    advocate_data?: Record<string, any>;
    rejection_reason?: string | null;
    reviewed_by_email?: string | null;
    reviewed_at?: string | null;
    created_at: string;
    updated_at: string;
    documents?: {
      id: string;
      doc_key: string;
      original_name: string;
      content_type?: string;
      size_bytes?: number;
      uploaded_at?: string;
      file_url: string | null;
    }[];
  };
};

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

function mapStatus(status: string): AdvocateVerificationStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "pending") return "pending";
  return "under_review";
}

/** Map a Django onboarding application record → AdminAdvocate */
function mapToAdminAdvocate(rec: DjangoAdvocateListResponse["data"]["results"][number]): AdminAdvocate {
  return {
    id: rec.id,
    user_id: 0,
    full_name: rec.full_name || rec.email,
    email: rec.email,
    mobile: rec.mobile || "—",
    bar_number: rec.bar_number || "—",
    enrollment_number: "—",
    practice_areas: [],
    state_bar_council: "—",
    years_of_experience: 0,
    verification_status: mapStatus(rec.status),
    profile_bio: "",
    created_at: rec.created_at,
    updated_at: rec.reviewed_at ?? rec.created_at,
  };
}

/** Map Django detail response data → AdminAdvocateDetail */
function mapToAdminAdvocateDetail(d: DjangoAdvocateDetailResponse["data"]): AdminAdvocateDetail {
  const personal = d.personal_data || {};
  const advocate = d.advocate_data || {};
  const address = d.address_data || {};

  return {
    id: d.id,
    reference_id: d.reference_id,
    email: d.email,
    status: mapStatus(d.status),
    full_name: personal.fullName || personal.name || d.email,
    mobile: personal.mobile || personal.phone || "—",
    bar_number: advocate.barNumber || advocate.bar_number || "—",
    enrollment_number: advocate.enrollmentNumber || advocate.enrollment_number || "—",
    practice_areas: Array.isArray(advocate.practiceAreas)
      ? advocate.practiceAreas
      : Array.isArray(advocate.practice_areas)
        ? advocate.practice_areas
        : [],
    state_bar_council: advocate.stateBarCouncil || advocate.state_bar_council || "—",
    years_of_experience: Number(advocate.yearsOfExperience || advocate.years_of_experience) || 0,
    rejection_reason: d.rejection_reason || null,
    reviewed_by_email: d.reviewed_by_email || null,
    reviewed_at: d.reviewed_at || null,
    created_at: d.created_at,
    updated_at: d.updated_at,
    personal_data: personal,
    address_data: address,
    advocate_data: advocate,
    documents: (d.documents || []).map((doc) => ({
      id: doc.id,
      doc_key: doc.doc_key,
      original_name: doc.original_name || doc.doc_key,
      content_type: doc.content_type,
      size_bytes: doc.size_bytes,
      uploaded_at: doc.uploaded_at,
      file_url: doc.file_url,
    })),
  };
}

export const adminAdvocatesService = {
  /**
   * List advocates — calls Django REST API, falls back to mock on error.
   */
  listAdvocates: async (
    params: AdminListParams & { status?: string } = {}
  ): Promise<PaginatedResponse<AdminAdvocate>> => {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== "all") query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      if (params.page && params.page > 1) query.set("page", String(params.page));
      if (params.page_size) query.set("page_size", String(params.page_size));

      const qs = query.toString();
      const path = `${API_ENDPOINTS.onboarding.adminAdvocates}${qs ? `?${qs}` : ""}`;

      const res = await apiClient<DjangoAdvocateListResponse>(path, {
        headers: authHeaders(),
        suppressErrorLog: true,
      });

      return {
        results: res.data.results.map(mapToAdminAdvocate),
        count: res.data.count,
        next: res.data.next,
        previous: res.data.previous,
      };
    } catch {
      let results = [...mockAdvocates];
      if (params.search) {
        const q = params.search.toLowerCase();
        results = results.filter(
          (a) =>
            a.full_name.toLowerCase().includes(q) ||
            a.email.toLowerCase().includes(q) ||
            a.bar_number.toLowerCase().includes(q)
        );
      }
      if (params.status && params.status !== "all") {
        results = results.filter((a) => a.verification_status === params.status);
      }

      const page = params.page ?? 1;
      const pageSize = params.page_size ?? 10;
      const start = (page - 1) * pageSize;

      return {
        results: results.slice(start, start + pageSize),
        count: results.length,
        next: start + pageSize < results.length ? "next" : null,
        previous: page > 1 ? "prev" : null,
      };
    }
  },

  /**
   * Get single advocate application detail.
   */
  getAdvocateDetail: async (id: string): Promise<AdminAdvocateDetail | null> => {
    try {
      const res = await apiClient<DjangoAdvocateDetailResponse>(
        API_ENDPOINTS.onboarding.adminAdvocateDetail(id),
        { headers: authHeaders(), suppressErrorLog: true },
      );
      return mapToAdminAdvocateDetail(res.data);
    } catch {
      // Mock fallback if id matches
      const m = mockAdvocates.find((a) => a.id === id);
      if (!m) return null;
      return {
        id: m.id,
        reference_id: `ADV-${m.id.slice(0, 8).toUpperCase()}`,
        email: m.email,
        status: m.verification_status,
        full_name: m.full_name,
        mobile: m.mobile,
        bar_number: m.bar_number,
        enrollment_number: m.enrollment_number,
        practice_areas: m.practice_areas,
        state_bar_council: m.state_bar_council,
        years_of_experience: m.years_of_experience,
        rejection_reason: null,
        reviewed_by_email: null,
        reviewed_at: null,
        created_at: m.created_at,
        updated_at: m.updated_at,
        personal_data: { fullName: m.full_name, mobile: m.mobile, email: m.email },
        address_data: {},
        advocate_data: {
          barNumber: m.bar_number,
          enrollmentNumber: m.enrollment_number,
          stateBarCouncil: m.state_bar_council,
          yearsOfExperience: m.years_of_experience,
          practiceAreas: m.practice_areas,
          bio: m.profile_bio,
        },
        documents: [],
      };
    }
  },

  /**
   * Approve advocate application
   */
  approveAdvocate: async (id: string): Promise<AdminAdvocateDetail> => {
    const res = await apiClient<DjangoAdvocateDetailResponse>(
      API_ENDPOINTS.onboarding.adminAdvocateApprove(id),
      {
        method: "POST",
        headers: authHeaders(),
      }
    );
    return mapToAdminAdvocateDetail(res.data);
  },

  /**
   * Reject advocate application
   */
  rejectAdvocate: async (id: string, reason: string): Promise<AdminAdvocateDetail> => {
    const res = await apiClient<DjangoAdvocateDetailResponse>(
      API_ENDPOINTS.onboarding.adminAdvocateReject(id),
      {
        method: "POST",
        headers: authHeaders(),
        body: { reason },
      }
    );
    return mapToAdminAdvocateDetail(res.data);
  },
};


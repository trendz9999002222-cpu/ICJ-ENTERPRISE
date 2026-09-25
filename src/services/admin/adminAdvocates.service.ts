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
// Admin Advocates / Professionals Service
// Connected to Django REST API: /api/v1/admin/professional-onboarding/registrations/
// =============================================================================

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

type BackendRegistrationItem = {
  id: string;
  reference_id: string;
  applicant_name: string;
  email: string;
  mobile?: string;
  photo_url?: string | null;
  categories: string[];
  groups: string[];
  professions: string[];
  status: string;
  created_at: string;
};

type BackendRegistrationDetail = {
  id: string;
  reference_id: string;
  status: string;
  submitted_by: string | null;
  applicant_name: string;
  email: string;
  mobile?: string;
  photo_url?: string | null;
  enrollment_number?: string;
  regulatory_body?: string;
  categories: { id: string; name: string }[];
  groups: { id: string; name: string }[];
  professions: { id: string; name: string }[];
  common_field_values: Record<string, any>;
  profession_field_values: Record<string, any>;
  files: {
    id: string;
    document_key: string;
    original_name: string;
    content_type: string;
    size_bytes: number;
    uploaded_at: string;
    file_url?: string | null;
  }[];
  created_at: string;
  updated_at: string;
};

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  return `${backendBase.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
}

function parsePossibleJson(val: any): any {
  if (typeof val === "string" && (val.startsWith("{") || val.startsWith("["))) {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

function flattenProfFieldValues(raw: Record<string, any>): Record<string, any> {
  if (!raw || typeof raw !== "object") return {};
  const result: Record<string, any> = {};

  for (const [k, v] of Object.entries(raw)) {
    const parsed = parsePossibleJson(v);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      if ("field_name" in parsed && "value" in parsed) {
        result[parsed.field_name || k] = parsePossibleJson(parsed.value);
      } else {
        for (const [subK, subV] of Object.entries(parsed)) {
          const subParsed = parsePossibleJson(subV);
          if (
            subParsed &&
            typeof subParsed === "object" &&
            !Array.isArray(subParsed) &&
            "field_name" in subParsed &&
            "value" in subParsed
          ) {
            result[subParsed.field_name || subK] = parsePossibleJson(subParsed.value);
          } else {
            result[subK] = subParsed;
          }
        }
      }
    } else {
      result[k] = parsed;
    }
  }
  return result;
}

function mapStatus(status: string): AdvocateVerificationStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "pending") return "pending";
  return "under_review";
}

function mapRegistrationToAdminAdvocate(rec: BackendRegistrationItem): AdminAdvocate {
  const categories = Array.isArray(rec.categories) ? rec.categories : [];
  const groups = Array.isArray(rec.groups) ? rec.groups : [];
  const professions = Array.isArray(rec.professions) ? rec.professions : [];

  return {
    id: rec.id,
    user_id: 0,
    full_name: rec.applicant_name || rec.email,
    email: rec.email,
    mobile: rec.mobile || "—",
    photo_url: resolveMediaUrl(rec.photo_url),
    category_name: categories.join(", ") || undefined,
    group_name: groups.join(", ") || undefined,
    profession_name: professions.join(", ") || "Professional",
    categories,
    groups,
    professions,
    bar_number: rec.reference_id,
    enrollment_number: rec.reference_id,
    practice_areas: [],
    state_bar_council: "—",
    years_of_experience: 0,
    verification_status: mapStatus(rec.status),
    profile_bio: "",
    created_at: rec.created_at,
    updated_at: rec.created_at,
  };
}

function mapDetailToAdminAdvocateDetail(d: BackendRegistrationDetail): AdminAdvocateDetail {
  const common = d.common_field_values || {};
  const rawProf = d.profession_field_values || {};
  const prof = flattenProfFieldValues(rawProf);

  const categories = d.categories || [];
  const groups = d.groups || [];
  const professions = d.professions || [];

  let photoUrl: string | null = resolveMediaUrl(d.photo_url);
  const docs = (d.files || []).map((f) => {
    const resolved = resolveMediaUrl(f.file_url);
    if (!photoUrl && f.document_key in { photo: 1, profile_photo: 1, passport_photo: 1, avatar: 1 }) {
      photoUrl = resolved;
    }
    return {
      id: f.id,
      doc_key: f.document_key,
      original_name: f.original_name || f.document_key,
      content_type: f.content_type,
      size_bytes: f.size_bytes,
      uploaded_at: f.uploaded_at,
      file_url: resolved,
    };
  });

  const practiceAreas = Array.isArray(prof.practice_areas)
    ? prof.practice_areas
    : Array.isArray(prof.specialisations)
    ? prof.specialisations
    : typeof prof.practice_areas === "string"
    ? prof.practice_areas.split(",").map((s: string) => s.trim())
    : [];

  return {
    id: d.id,
    reference_id: d.reference_id,
    email: d.email || common.email || "—",
    status: mapStatus(d.status),
    full_name: d.applicant_name || common.full_name || common.name || "—",
    mobile: d.mobile || common.mobile_number || common.mobile || common.phone || "—",
    photo_url: photoUrl,
    category_name: categories.map((c) => c.name).join(", "),
    group_name: groups.map((g) => g.name).join(", "),
    profession_name: professions.map((p) => p.name).join(", ") || "Professional",
    categories,
    groups,
    professions,
    bar_number: prof.enrollment_number || prof.bar_number || d.enrollment_number || d.reference_id,
    enrollment_number: prof.enrollment_number || prof.bar_number || d.enrollment_number || d.reference_id,
    practice_areas: practiceAreas,
    state_bar_council: prof.bar_council || prof.state_bar_council || d.regulatory_body || "—",
    years_of_experience: Number(prof.experience || prof.years_of_experience) || 0,
    rejection_reason: null,
    reviewed_by_email: null,
    reviewed_at: null,
    created_at: d.created_at,
    updated_at: d.updated_at,
    personal_data: common,
    address_data: {
      address: common.address || prof.office_address || prof.address,
      city: prof.practice_city || common.city || prof.city,
      state: prof.state || common.state || prof.practice_state,
      pincode: common.pincode || prof.pincode,
    },
    advocate_data: prof,
    profession_field_values: rawProf,
    common_field_values: common,
    documents: docs,
  };
}

export const adminAdvocatesService = {
  /**
   * List advocates/professionals from registration submissions API.
   */
  listAdvocates: async (
    params: AdminListParams & { status?: string } = {}
  ): Promise<PaginatedResponse<AdminAdvocate>> => {
    try {
      const query = new URLSearchParams();
      if (params.status && params.status !== "all") query.set("status", params.status);
      if (params.search) query.set("search", params.search);
      if (params.category) query.set("category", params.category);
      if (params.group) query.set("group", params.group);
      if (params.profession) query.set("profession", params.profession);
      if (params.page && params.page > 0) query.set("page", String(params.page));
      if (params.page_size) query.set("page_size", String(params.page_size));

      const qs = query.toString();
      const path = `${API_ENDPOINTS.adminProfessionalOnboarding.registrations}${qs ? `?${qs}` : ""}`;

      const res = await apiClient<ApiEnvelope<PaginatedResponse<BackendRegistrationItem>>>(path, {
        headers: authHeaders(),
      });

      return {
        results: res.data.results.map(mapRegistrationToAdminAdvocate),
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
   * Get single advocate / professional registration detail.
   */
  getAdvocateDetail: async (id: string): Promise<AdminAdvocateDetail | null> => {
    try {
      const res = await apiClient<ApiEnvelope<BackendRegistrationDetail>>(
        API_ENDPOINTS.adminProfessionalOnboarding.registration(id),
        { headers: authHeaders() }
      );
      return mapDetailToAdminAdvocateDetail(res.data);
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
        photo_url: null,
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
   * Approve advocate / professional
   */
  approveAdvocate: async (id: string): Promise<AdminAdvocateDetail> => {
    const res = await apiClient<ApiEnvelope<BackendRegistrationDetail>>(
      API_ENDPOINTS.adminProfessionalOnboarding.registrationApprove(id),
      {
        method: "POST",
        headers: authHeaders(),
      }
    );
    return mapDetailToAdminAdvocateDetail(res.data);
  },

  /**
   * Reject advocate / professional
   */
  rejectAdvocate: async (id: string, reason?: string): Promise<AdminAdvocateDetail> => {
    const res = await apiClient<ApiEnvelope<BackendRegistrationDetail>>(
      API_ENDPOINTS.adminProfessionalOnboarding.registrationReject(id),
      {
        method: "POST",
        headers: authHeaders(),
        body: { reason },
      }
    );
    return mapDetailToAdminAdvocateDetail(res.data);
  },
};

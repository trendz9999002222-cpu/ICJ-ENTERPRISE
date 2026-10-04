import { mockServices } from "@/data/public/services";
import { mockProfessionals } from "@/data/public/professionals";
import { mockAcademyCourses, mockResearchPapers, mockTrainingEvents } from "@/data/public/research";
import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { maskPublicProfessional } from "@/lib/privacy/maskPublicIdentity";
import { paginateArray } from "@/services/public/paginate";
import type {
  AcademyCourse,
  JusticeService,
  PublicPaginatedResponse,
  PublicPaginationParams,
  PublicProfessional,
  ResearchPaper,
  TrainingEvent,
} from "@/types/public";

// =============================================================================
// Justice Services Service
// =============================================================================

export const serviceService = {
  listServices: async (
    params: PublicPaginationParams = {}
  ): Promise<PublicPaginatedResponse<JusticeService>> => {
    await new Promise((r) => setTimeout(r, 100));
    let filtered = [...mockServices];

    if (params.category && params.category !== "all") {
      filtered = filtered.filter((s) => s.category === params.category);
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.availableAssistance.some((a) => a.toLowerCase().includes(q))
      );
    }

    return paginateArray(filtered, params.page ?? 1, params.pageSize ?? 9);
  },

  getServiceBySlug: async (slug: string): Promise<JusticeService | null> => {
    await new Promise((r) => setTimeout(r, 50));
    return mockServices.find((s) => s.slug === slug) ?? null;
  },

  getFeaturedServices: async (): Promise<JusticeService[]> => {
    return mockServices.filter((s) => s.featured);
  },
};

// =============================================================================
// Professionals Service
// =============================================================================

function mapBackendToPublicProfessional(p: any): PublicProfessional {
  return {
    id: p.id || p.reference_id,
    fullName: p.full_name,
    profession: p.profession_name || "Advocate",
    categoryName: p.category_name,
    photoUrl: p.photo_url || null,
    barOrRegNumber: p.enrollment_number || p.reference_id,
    stateBarCouncil: p.bar_council || p.state,
    specialisations: Array.isArray(p.specialisations) && p.specialisations.length > 0 ? p.specialisations : ["General Practice"],
    experienceYears: Number(p.experience_years) || 5,
    state: p.state || "Delhi",
    city: p.city || "New Delhi",
    languages: Array.isArray(p.languages) && p.languages.length > 0 ? p.languages : ["English", "Hindi"],
    isVerified: p.is_verified ?? true,
    profileBio: p.overview || "",
    availability: p.consultation_modes || "Both",
    qualifications: p.qualification ? [p.qualification] : ["Graduate Practitioner"],
    courtsOrJurisdiction: Array.isArray(p.courts) && p.courts.length > 0 ? p.courts : ["High Court"],
  };
}

export const professionalService = {
  listProfessionals: async (
    params: PublicPaginationParams & {
      category?: string;
      group?: string;
      profession?: string;
      state?: string;
      specialisation?: string;
      experienceMin?: number;
    } = {}
  ): Promise<PublicPaginatedResponse<PublicProfessional>> => {
    try {
      const q = new URLSearchParams();
      if (params.page) q.set("page", String(params.page));
      if (params.pageSize) q.set("page_size", String(params.pageSize));
      if (params.search) q.set("search", params.search);
      if (params.category && params.category !== "all") q.set("category", params.category);
      if (params.group && params.group !== "all") q.set("group", params.group);
      if (params.profession && params.profession !== "all") q.set("profession", params.profession);
      if (params.state && params.state !== "all" && params.state !== "All States") q.set("state", params.state);

      const qs = q.toString();
      const path = `${API_ENDPOINTS.professionalOnboardingPublic.publicProfessionals}${qs ? `?${qs}` : ""}`;
      const res = await apiClient<{ success: boolean; data: { count: number; next: string | null; previous: string | null; results: any[] } }>(path, {
        suppressErrorLog: true,
      });

      const apiResults = (res.data?.results || []).map(mapBackendToPublicProfessional);
      return {
        count: res.data?.count || 0,
        next: res.data?.next || null,
        previous: res.data?.previous || null,
        results: apiResults,
      };
    } catch (error) {
      console.error("Failed to fetch professionals from API:", error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: [],
      };
    }
  },

  getProfessionalById: async (id: string): Promise<PublicProfessional | null> => {
    try {
      const path = API_ENDPOINTS.professionalOnboardingPublic.publicProfessionalDetail(id);
      const res = await apiClient<{ success: boolean; data: any }>(path, { suppressErrorLog: true });
      if (res?.data) {
        return mapBackendToPublicProfessional(res.data);
      }
      return null;
    } catch (error) {
      console.error("Failed to fetch professional by ID from API:", error);
      return null;
    }
  },

  getProfessionalsFilters: async (): Promise<{ professions: { label: string; value: string }[]; states: string[] }> => {
    try {
      const path = `${API_ENDPOINTS.professionalOnboardingPublic.publicProfessionals}filters/`;
      const res = await apiClient<{ success: boolean; data: { professions: { label: string; value: string }[]; states: string[] } }>(path, { suppressErrorLog: true });
      if (res?.data) {
        return res.data;
      }
    } catch (error) {
      console.error("Failed to fetch professional filters from API:", error);
    }
    return {
      professions: [{ label: "All Practitioners", value: "all" }],
      states: ["All States"],
    };
  },
};

// =============================================================================
// Research Service
// =============================================================================

export const researchService = {
  listPapers: async (
    params: PublicPaginationParams = {}
  ): Promise<PublicPaginatedResponse<ResearchPaper>> => {
    await new Promise((r) => setTimeout(r, 100));
    let filtered = [...mockResearchPapers];

    if (params.category && params.category !== "all") {
      filtered = filtered.filter(
        (rp) => rp.category.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (rp) =>
          rp.title.toLowerCase().includes(q) ||
          rp.abstract.toLowerCase().includes(q) ||
          rp.authors.some((a) => a.toLowerCase().includes(q)) ||
          rp.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return paginateArray(filtered, params.page ?? 1, params.pageSize ?? 6);
  },
};

// =============================================================================
// Academy Service
// =============================================================================

export const academyService = {
  listCourses: async (
    params: PublicPaginationParams = {}
  ): Promise<PublicPaginatedResponse<AcademyCourse>> => {
    await new Promise((r) => setTimeout(r, 100));
    let filtered = [...mockAcademyCourses];

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          c.instructor.toLowerCase().includes(q)
      );
    }

    return paginateArray(filtered, params.page ?? 1, params.pageSize ?? 6);
  },

  listEvents: async (): Promise<TrainingEvent[]> => {
    return mockTrainingEvents;
  },
};

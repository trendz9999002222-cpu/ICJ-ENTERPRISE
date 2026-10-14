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

/** Maps Django snake_case response to frontend camelCase JusticeService type */
function toArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === "string" && val.trim()) return [val];
  return [];
}

function mapBackendService(s: any): JusticeService {
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDescription: s.short_description ?? s.shortDescription ?? "",
    category: s.category?.value ?? s.category ?? "",
    categoryLabel: s.category_label ?? s.categoryLabel ?? "",
    iconName: s.icon_name ?? s.iconName ?? "",
    whoItIsFor: toArray(s.who_it_is_for ?? s.whoItIsFor),
    howIcjHelps: toArray(s.how_icj_helps ?? s.howIcjHelps),
    availableAssistance: toArray(s.available_assistance ?? s.availableAssistance),
    nextSteps: toArray(s.next_steps ?? s.nextSteps),
    relatedProfessionals: toArray(s.related_professionals ?? s.relatedProfessionals),
    featured: s.is_featured ?? s.featured ?? false,
  };
}

export const serviceService = {
  listServices: async (
    params: PublicPaginationParams & { featured?: boolean } = {}
  ): Promise<PublicPaginatedResponse<JusticeService>> => {
    try {
      const q = new URLSearchParams();
      if (params.page) q.set("page", String(params.page));
      if (params.pageSize) q.set("page_size", String(params.pageSize));
      if (params.search) q.set("search", params.search);
      if (params.category && params.category !== "all") q.set("category", params.category);
      if (params.featured !== undefined) q.set("featured", String(params.featured));

      const qs = q.toString();
      const path = `${API_ENDPOINTS.publicServices.list}${qs ? `?${qs}` : ""}`;
      const res = await apiClient<{ data: { results: any[]; count: number; next: string | null; previous: string | null } }>(path, {
        suppressErrorLog: true,
      });
      return {
        count: res.data.count,
        next: res.data.next,
        previous: res.data.previous,
        results: res.data.results.map(mapBackendService),
      };
    } catch (error) {
      console.error("Failed to fetch services:", error);
      return { count: 0, next: null, previous: null, results: [] };
    }
  },

  getServiceBySlug: async (slug: string): Promise<JusticeService | null> => {
    try {
      const path = API_ENDPOINTS.publicServices.detail(slug);
      const res = await apiClient<{ data: any }>(path, { suppressErrorLog: true });
      return mapBackendService(res.data);
    } catch (error) {
      console.error("Failed to fetch service by slug:", error);
      return null;
    }
  },

  getFeaturedServices: async (): Promise<JusticeService[]> => {
    try {
      const path = API_ENDPOINTS.publicServices.featured;
      const res = await apiClient<{ data: any[] }>(path, { suppressErrorLog: true });
      return res.data.map(mapBackendService);
    } catch (error) {
      console.error("Failed to fetch featured services:", error);
      return [];
    }
  },
  
  getCategories: async (): Promise<{ label: string; value: string }[]> => {
    try {
      const path = API_ENDPOINTS.publicServices.categories;
      const res = await apiClient<{ data: any[] }>(path, { suppressErrorLog: true });
      return [{ label: "All Services", value: "all" }, ...res.data.map((c) => ({ label: c.name, value: c.value }))];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [
        { label: "All Services", value: "all" },
        { label: "Specialized Law", value: "specialized_law" },
        { label: "Citizen Assistance", value: "assistance" },
        { label: "Dispute Resolution", value: "dispute_resolution" },
        { label: "Governance & Schemes", value: "governance_schemes" },
        { label: "Legal Information", value: "legal_information" },
      ];
    }
  },
  submitSeekAssistance: async (data: any): Promise<{ success: boolean; data?: any; error?: any }> => {
    try {
      const path = API_ENDPOINTS.publicServices.seekAssistance;
      const res = await apiClient<{ success: boolean; data: any; message?: string }>(path, {
        method: "POST",
        body: data,
        suppressErrorLog: true,
      });
      return { success: true, data: res.data };
    } catch (error) {
      console.error("Failed to submit assistance request:", error);
      return { success: false, error };
    }
  }
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
    registeredCategories: p.registered_categories || [],
    registeredProfessions: p.registered_professions || [],
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
      city?: string;
      specialisation?: string;
      experienceMin?: number;
      is_verified?: boolean;
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
      if (params.city && params.city !== "all" && params.city !== "All Cities") q.set("city", params.city);
      if (params.experienceMin !== undefined) q.set("experience_min", String(params.experienceMin));
      if (params.is_verified !== undefined) q.set("is_verified", params.is_verified ? "true" : "false");

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

  getProfessionalsFilters: async (): Promise<{
    professions: { label: string; value: string }[];
    categories: { label: string; value: string }[];
    states: string[];
    cities: string[];
  }> => {
    try {
      const path = `${API_ENDPOINTS.professionalOnboardingPublic.publicProfessionals}filters/`;
      const res = await apiClient<{
        success: boolean;
        data: {
          professions: { label: string; value: string }[];
          categories: { label: string; value: string }[];
          states: string[];
          cities: string[];
        };
      }>(path, { suppressErrorLog: true });
      if (res?.data) {
        return res.data;
      }
    } catch (error) {
      console.error("Failed to fetch professional filters from API:", error);
    }
    return {
      professions: [{ label: "All Practitioners", value: "all" }],
      categories: [{ label: "All Categories", value: "all" }],
      states: ["All States"],
      cities: ["All Cities"],
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

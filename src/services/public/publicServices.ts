import { mockServices } from "@/data/public/services";
import { mockProfessionals } from "@/data/public/professionals";
import { mockAcademyCourses, mockResearchPapers, mockTrainingEvents } from "@/data/public/research";
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

export const professionalService = {
  listProfessionals: async (
    params: PublicPaginationParams & {
      profession?: string;
      state?: string;
      specialisation?: string;
      experienceMin?: number;
    } = {}
  ): Promise<PublicPaginatedResponse<PublicProfessional>> => {
    await new Promise((r) => setTimeout(r, 120));
    let filtered = [...mockProfessionals];

    if (params.profession && params.profession !== "all") {
      filtered = filtered.filter(
        (p) => p.profession.toLowerCase() === params.profession?.toLowerCase()
      );
    }

    if (params.state && params.state !== "all") {
      filtered = filtered.filter((p) => p.state.toLowerCase() === params.state?.toLowerCase());
    }

    if (params.specialisation && params.specialisation !== "all") {
      filtered = filtered.filter((p) =>
        p.specialisations.some(
          (sp) => sp.toLowerCase() === params.specialisation?.toLowerCase()
        )
      );
    }

    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q) ||
          p.specialisations.some((s) => s.toLowerCase().includes(q))
      );
    }

    return paginateArray(filtered, params.page ?? 1, params.pageSize ?? 8);
  },

  getProfessionalById: async (id: string): Promise<PublicProfessional | null> => {
    await new Promise((r) => setTimeout(r, 60));
    return mockProfessionals.find((p) => p.id === id) ?? null;
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

import { mockCases } from "@/data/admin/cases";
import type { AdminCase, AdminListParams, PaginatedResponse } from "@/types/admin";

// =============================================================================
// Admin Cases Service
//
// Future API endpoints:
//   GET /api/v1/admin/cases/
//   GET /api/v1/admin/cases/:id/
// =============================================================================

function applyFilters(store: AdminCase[], params: AdminListParams & { status?: string }) {
  let results = [...store];

  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (c) =>
        c.case_number.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.client_name.toLowerCase().includes(q) ||
        c.advocate_name.toLowerCase().includes(q) ||
        c.practice_area.toLowerCase().includes(q)
    );
  }

  if (params.status && params.status !== "all") {
    results = results.filter((c) => c.status === params.status);
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

export const adminCasesService = {
  /**
   * List cases with filtering and pagination.
   * Future: return apiClient<PaginatedResponse<AdminCase>>(`/admin/cases/?${qs}`, { headers: authHeaders() });
   */
  listCases: async (
    params: AdminListParams & { status?: string } = {}
  ): Promise<PaginatedResponse<AdminCase>> => {
    await new Promise((r) => setTimeout(r, 200));
    return applyFilters(mockCases, params);
  },

  /**
   * Get single case by ID.
   * Future: return apiClient<AdminCase>(`/admin/cases/${id}/`, { headers: authHeaders() });
   */
  getCase: async (id: string): Promise<AdminCase | null> => {
    await new Promise((r) => setTimeout(r, 150));
    return mockCases.find((c) => c.id === id) ?? null;
  },
};

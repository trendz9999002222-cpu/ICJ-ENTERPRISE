import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdminListParams, PaginatedResponse } from "@/types/admin";

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const adminCasesService = {
  listCases: async (
    params: AdminListParams & { status?: string } = {}
  ): Promise<PaginatedResponse<any>> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);
    if (params.status && params.status !== "all") q.set("status", params.status);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.adminServices.cases}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<any>>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  getCase: async (id: string): Promise<any | null> => {
    try {
      const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.adminServices.caseDetail(id), {
        headers: authHeaders(),
      });
      return res.data;
    } catch (err) {
      return null;
    }
  },
};

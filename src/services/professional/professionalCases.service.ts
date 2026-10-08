import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

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

type PaginatedResponse<T> = {
  count: number;
  results: T[];
  next: string | null;
  previous: string | null;
};

export const professionalCasesService = {
  /** Get all OPEN cases available to take based on professional's approved groups */
  getAvailableCases: async (params: { page?: number; page_size?: number; search?: string } = {}): Promise<PaginatedResponse<any>> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.professionalServices.availableCases}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<any>>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Get cases taken/assigned to the logged-in professional */
  getMyCases: async (params: { status?: string; page?: number; page_size?: number } = {}): Promise<PaginatedResponse<any>> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.status && params.status !== "all") q.set("status", params.status);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.professionalServices.myCases}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<any>>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Professional takes/accepts a case – locks it to them */
  takeCase: async (caseId: string): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.professionalServices.takeCase(caseId), {
      method: "POST",
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Get details of a specific case */
  getCaseDetails: async (caseId: string): Promise<any> => {
    const res = await apiClient<ApiEnvelope<any>>(API_ENDPOINTS.professionalServices.caseDetail(caseId), {
      headers: authHeaders(),
    });
    return res.data;
  },
};

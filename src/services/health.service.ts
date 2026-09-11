import { apiClient } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { HealthResponse } from "@/types/api";

export const healthService = {
  check: () => apiClient<HealthResponse>(API_ENDPOINTS.health),
};

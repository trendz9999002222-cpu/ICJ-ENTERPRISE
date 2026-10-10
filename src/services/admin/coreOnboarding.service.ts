import { ApiError, apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import type {
  CommonField,
  CoreOnboardingListParams,
  FormFieldConfig,
  Paginated,
} from "@/types/admin/coreOnboarding";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) throw new Error("Not authenticated");
  return { Authorization: `Bearer ${token}` };
}

function buildQuery(params?: CoreOnboardingListParams): string {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    q.set(key, String(value));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

type RequestOptions = {
  method?: string;
  body?: unknown;
};

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const res = await apiClient<ApiEnvelope<T>>(path, {
    method: init?.method,
    body: init?.body,
    headers: authHeaders(),
  });
  return res.data;
}

export const coreOnboardingService = {
  // Common Fields (Master)
  listCommonFields: (p?: CoreOnboardingListParams) =>
    request<Paginated<CommonField>>(`/admin/core/common-fields/${buildQuery(p)}`),
  createCommonField: (data: Partial<CommonField>) =>
    request<CommonField>("/admin/core/common-fields/", { method: "POST", body: data }),
  updateCommonField: (id: string, data: Partial<CommonField>) =>
    request<CommonField>(`/admin/core/common-fields/${id}/`, { method: "PATCH", body: data }),
  deleteCommonField: (id: string) =>
    request<void>(`/admin/core/common-fields/${id}/`, { method: "DELETE" }),

  // Form Field Configs (Mapping)
  listFormFieldConfigs: (p?: CoreOnboardingListParams) =>
    request<Paginated<FormFieldConfig>>(`/admin/core/form-field-configs/${buildQuery(p)}`),
  createFormFieldConfig: (data: Partial<FormFieldConfig>) =>
    request<FormFieldConfig>("/admin/core/form-field-configs/", { method: "POST", body: data }),
  updateFormFieldConfig: (id: string, data: Partial<FormFieldConfig>) =>
    request<FormFieldConfig>(`/admin/core/form-field-configs/${id}/`, { method: "PATCH", body: data }),
  deleteFormFieldConfig: (id: string) =>
    request<void>(`/admin/core/form-field-configs/${id}/`, { method: "DELETE" }),
};

export function getCoreApiErrorMessage(err: unknown, fallback: string = "An error occurred"): string {
  if (err instanceof ApiError && err.body && typeof err.body === "object") {
    const body = err.body as { message?: string };
    if (body.message) return body.message;
  } else if (err instanceof Error) {
    return err.message;
  }
  return fallback;
}

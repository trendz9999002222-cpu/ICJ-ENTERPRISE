/**
 * Admin Services Service — backed by real Django REST API.
 *
 * Endpoints:
 *   GET/POST  /api/v1/admin/services/              – list / create services
 *   GET/PATCH/DELETE /api/v1/admin/services/:id/    – service CRUD
 *   GET/POST  /api/v1/admin/services/categories/    – list / create categories
 *   GET/PATCH/DELETE /api/v1/admin/services/categories/:id/ – category CRUD
 */

import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdminJusticeService, AdminListParams, AdminServiceCategory, PaginatedResponse } from "@/types/admin";

// ---------------------------------------------------------------------------
// Auth helpers (same pattern as adminUsers.service.ts)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const adminServicesService = {
  // ── Categories ──────────────────────────────────────────────────────────

  listCategories: async (params: AdminListParams = {}): Promise<PaginatedResponse<AdminServiceCategory>> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);
    if (params.ordering) q.set("ordering", params.ordering);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.adminServices.categoriesList}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<AdminServiceCategory>>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  createCategory: async (data: Partial<AdminServiceCategory>): Promise<AdminServiceCategory> => {
    const res = await apiClient<ApiEnvelope<AdminServiceCategory>>(API_ENDPOINTS.adminServices.categoriesList, {
      method: "POST",
      headers: authHeaders(),
      body: data,
    });
    return res.data;
  },

  updateCategory: async (id: string, data: Partial<AdminServiceCategory>): Promise<AdminServiceCategory> => {
    const res = await apiClient<ApiEnvelope<AdminServiceCategory>>(API_ENDPOINTS.adminServices.categoryDetail(id), {
      method: "PATCH",
      headers: authHeaders(),
      body: data,
    });
    return res.data;
  },

  deleteCategory: async (id: string): Promise<void> => {
    await apiClient(API_ENDPOINTS.adminServices.categoryDetail(id), {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  // ── Services ────────────────────────────────────────────────────────────

  listServices: async (params: AdminListParams & { category?: string } = {}): Promise<PaginatedResponse<AdminJusticeService>> => {
    const q = new URLSearchParams();
    if (params.page) q.set("page", String(params.page));
    if (params.page_size) q.set("page_size", String(params.page_size));
    if (params.search) q.set("search", params.search);
    if (params.category && params.category !== "all") q.set("category", params.category);
    if (params.ordering) q.set("ordering", params.ordering);

    const qs = q.toString();
    const path = `${API_ENDPOINTS.adminServices.list}${qs ? `?${qs}` : ""}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<AdminJusticeService>>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  createService: async (data: Partial<AdminJusticeService>): Promise<AdminJusticeService> => {
    const res = await apiClient<ApiEnvelope<AdminJusticeService>>(API_ENDPOINTS.adminServices.list, {
      method: "POST",
      headers: authHeaders(),
      body: data,
    });
    return res.data;
  },

  updateService: async (id: string, data: Partial<AdminJusticeService>): Promise<AdminJusticeService> => {
    const res = await apiClient<ApiEnvelope<AdminJusticeService>>(API_ENDPOINTS.adminServices.detail(id), {
      method: "PATCH",
      headers: authHeaders(),
      body: data,
    });
    return res.data;
  },

  deleteService: async (id: string): Promise<void> => {
    await apiClient(API_ENDPOINTS.adminServices.detail(id), {
      method: "DELETE",
      headers: authHeaders(),
    });
  },
};

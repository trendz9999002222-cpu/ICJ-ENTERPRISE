/**
 * Admin Users Service — backed by real Django REST API.
 *
 * Endpoints:
 *   GET    /api/v1/admin/users/           – list users (paginated, filterable)
 *   GET    /api/v1/admin/users/:id/       – retrieve single user
 *   PATCH  /api/v1/admin/users/:id/       – update role / name / phone
 *   DELETE /api/v1/admin/users/:id/       – delete user
 *   POST   /api/v1/admin/users/:id/activate/   – activate
 *   POST   /api/v1/admin/users/:id/deactivate/ – deactivate / block
 */

import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { AdminListParams, AdminUser, PaginatedResponse } from "@/types/admin";

// ---------------------------------------------------------------------------
// Auth helpers
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

function buildQuery(params: AdminListParams): string {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.role) q.set("role", params.role);
  if (params.status) q.set("status", params.status);
  if (params.category) q.set("category", params.category);
  if (params.group) q.set("group", params.group);
  if (params.profession) q.set("profession", params.profession);
  if (params.page) q.set("page", String(params.page));
  if (params.page_size) q.set("page_size", String(params.page_size));
  if (params.ordering) q.set("ordering", params.ordering);
  const s = q.toString();
  return s ? `?${s}` : "";
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const adminUsersService = {
  /** List users with optional filtering/pagination. */
  listUsers: async (params: AdminListParams = {}): Promise<PaginatedResponse<AdminUser>> => {
    const path = `${API_ENDPOINTS.adminUsers.list}${buildQuery(params)}`;
    const res = await apiClient<ApiEnvelope<PaginatedResponse<AdminUser>>>(path, {
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Get a single user by ID. */
  getUser: async (id: number): Promise<AdminUser> => {
    const res = await apiClient<ApiEnvelope<AdminUser>>(API_ENDPOINTS.adminUsers.detail(id), {
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Update user fields (role, name, phone). */
  updateUser: async (id: number, data: Partial<Pick<AdminUser, "role" | "first_name" | "last_name">>): Promise<AdminUser> => {
    const res = await apiClient<ApiEnvelope<AdminUser>>(API_ENDPOINTS.adminUsers.detail(id), {
      method: "PATCH",
      body: data,
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Permanently delete a user. */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient<{ success: boolean }>(API_ENDPOINTS.adminUsers.detail(id), {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  /** Activate a user. */
  activateUser: async (id: number): Promise<AdminUser> => {
    const res = await apiClient<ApiEnvelope<AdminUser>>(API_ENDPOINTS.adminUsers.activate(id), {
      method: "POST",
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Deactivate / block a user. */
  deactivateUser: async (id: number): Promise<AdminUser> => {
    const res = await apiClient<ApiEnvelope<AdminUser>>(API_ENDPOINTS.adminUsers.deactivate(id), {
      method: "POST",
      headers: authHeaders(),
    });
    return res.data;
  },

  /** Generate or regenerate temporary password for a user. */
  resetUserPassword: async (id: number): Promise<{ user_id: number; email: string; name: string; role: string; temp_password: string; password_change_required: boolean }> => {
    const res = await apiClient<ApiEnvelope<{ user_id: number; email: string; name: string; role: string; temp_password: string; password_change_required: boolean }>>(
      API_ENDPOINTS.adminUsers.resetPassword(id),
      {
        method: "POST",
        headers: authHeaders(),
      }
    );
    return res.data;
  },

  /**
   * Convenience toggle: if active → deactivate, else → activate.
   */
  toggleUserStatus: async (id: number, currentStatus: string): Promise<AdminUser> => {
    if (currentStatus === "active") {
      return adminUsersService.deactivateUser(id);
    }
    return adminUsersService.activateUser(id);
  },
};

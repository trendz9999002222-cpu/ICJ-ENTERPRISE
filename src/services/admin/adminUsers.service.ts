import { mockUsers } from "@/data/admin/users";
import type { AdminListParams, AdminUser, AdminUserStatus, PaginatedResponse } from "@/types/admin";

// =============================================================================
// Admin Users Service
//
// Future API endpoints:
//   GET   /api/v1/admin/users/
//   GET   /api/v1/admin/users/:id/
//   PATCH /api/v1/admin/users/:id/  (activate/deactivate)
// =============================================================================

// In-memory store so mutations persist during session
let _userStore: AdminUser[] = [...mockUsers];

function filterAndPage(store: AdminUser[], params: AdminListParams) {
  let results = [...store];
  if (params.search) {
    const q = params.search.toLowerCase();
    results = results.filter(
      (u) =>
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.mobile.includes(q) ||
        u.username.toLowerCase().includes(q)
    );
  }
  if (params.status) {
    results = results.filter((u) => u.status === params.status);
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

export const adminUsersService = {
  /**
   * List users with optional filtering/pagination.
   * Future: return apiClient<PaginatedResponse<AdminUser>>(`/admin/users/?${qs}`, { headers: authHeaders() });
   */
  listUsers: async (params: AdminListParams = {}): Promise<PaginatedResponse<AdminUser>> => {
    await new Promise((r) => setTimeout(r, 200));
    return filterAndPage(_userStore, params);
  },

  /**
   * Get a single user by ID.
   * Future: return apiClient<AdminUser>(`/admin/users/${id}/`, { headers: authHeaders() });
   */
  getUser: async (id: number): Promise<AdminUser | null> => {
    await new Promise((r) => setTimeout(r, 150));
    return _userStore.find((u) => u.id === id) ?? null;
  },

  /**
   * Toggle a user's status between active ↔ inactive (or suspended ↔ active).
   * Future: return apiClient(`/admin/users/${id}/`, { method: "PATCH", body: { status }, headers: authHeaders() });
   */
  setUserStatus: async (id: number, status: AdminUserStatus): Promise<AdminUser> => {
    await new Promise((r) => setTimeout(r, 300));
    const idx = _userStore.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    _userStore[idx] = { ..._userStore[idx], status };
    return { ..._userStore[idx] };
  },

  /**
   * Convenience toggle: active → inactive, anything else → active.
   */
  toggleUserStatus: async (id: number): Promise<AdminUser> => {
    await new Promise((r) => setTimeout(r, 300));
    const idx = _userStore.findIndex((u) => u.id === id);
    if (idx === -1) throw new Error(`User ${id} not found`);
    const next: AdminUserStatus =
      _userStore[idx].status === "active" ? "inactive" : "active";
    _userStore[idx] = { ..._userStore[idx], status: next };
    return { ..._userStore[idx] };
  },
};

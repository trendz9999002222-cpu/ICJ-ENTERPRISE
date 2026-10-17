import { apiClient, readAccessTokenFromCookie } from "@/lib/api/client";

type ApiEnvelope<T> = { success: boolean; message: string; data: T };

const BASE_FIELDS = "/admin/services/form-fields";
const BASE_DOCS = "/admin/services/documents";

function authHeaders(): Record<string, string> {
  const token = readAccessTokenFromCookie();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export type AssistanceFormField = {
  id: string;
  field_key: string;
  label: string;
  field_type: string;
  required: boolean;
  options?: any;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};

export type AssistanceDocument = {
  id: string;
  name: string;
  document_key: string;
  description: string;
  allowed_file_types: string[];
  max_file_size_mb: number;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
};

export const assistanceOnboardingAdminService = {
  // --- Form Fields (Tab 2: Legal Matter) ---
  async listFields(): Promise<AssistanceFormField[]> {
    const res = await apiClient<ApiEnvelope<{ results: AssistanceFormField[] }>>(`${BASE_FIELDS}/`, {
      headers: authHeaders(),
    });
    return res.data?.results || [];
  },

  async getField(id: string): Promise<AssistanceFormField> {
    const res = await apiClient<ApiEnvelope<AssistanceFormField>>(`${BASE_FIELDS}/${id}/`, {
      headers: authHeaders(),
    });
    return res.data;
  },

  async createField(data: {
    label: string;
    field_key?: string;
    field_type: string;
    required: boolean;
    display_order?: number;
    is_active?: boolean;
    options?: any;
  }): Promise<AssistanceFormField> {
    const res = await apiClient<ApiEnvelope<AssistanceFormField>>(`${BASE_FIELDS}/`, {
      method: "POST",
      headers: authHeaders(),
      body: data,
    });
    return res.data;
  },

  async updateField(
    id: string,
    data: Partial<{
      label: string;
      field_key: string;
      field_type: string;
      required: boolean;
      display_order: number;
      is_active: boolean;
      options: any;
    }>
  ): Promise<AssistanceFormField> {
    const res = await apiClient<ApiEnvelope<AssistanceFormField>>(`${BASE_FIELDS}/${id}/`, {
      method: "PUT",
      headers: authHeaders(),
      body: { id, ...data },
    });
    return res.data;
  },

  async deleteField(id: string): Promise<void> {
    await apiClient<ApiEnvelope<void>>(`${BASE_FIELDS}/${id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },

  // --- Supporting Documents (Tab 3: Supporting Documents) ---
  async listDocuments(): Promise<AssistanceDocument[]> {
    const res = await apiClient<ApiEnvelope<{ results: AssistanceDocument[] }>>(`${BASE_DOCS}/`, {
      headers: authHeaders(),
    });
    return res.data?.results || [];
  },

  async createDocument(data: {
    name: string;
    document_key?: string;
    description?: string;
    allowed_file_types?: string[] | string;
    max_file_size_mb?: number;
    is_required?: boolean;
    is_active?: boolean;
    display_order?: number;
  }): Promise<AssistanceDocument> {
    const res = await apiClient<ApiEnvelope<AssistanceDocument>>(`${BASE_DOCS}/`, {
      method: "POST",
      headers: authHeaders(),
      body: data,
    });
    return res.data;
  },

  async updateDocument(
    id: string,
    data: Partial<{
      name: string;
      document_key: string;
      description: string;
      allowed_file_types: string[] | string;
      max_file_size_mb: number;
      is_required: boolean;
      is_active: boolean;
      display_order: number;
    }>
  ): Promise<AssistanceDocument> {
    const res = await apiClient<ApiEnvelope<AssistanceDocument>>(`${BASE_DOCS}/${id}/`, {
      method: "PUT",
      headers: authHeaders(),
      body: { id, ...data },
    });
    return res.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await apiClient<ApiEnvelope<void>>(`${BASE_DOCS}/${id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  },
};

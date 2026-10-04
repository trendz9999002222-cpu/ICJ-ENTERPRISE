import { apiClient, apiClientFormData } from "@/lib/api/client";

const BASE = "/honorable-advisory";

export type HonorableAdvisoryMember = {
  id: string;
  name: string;
  role: string;
  qualification: string;
  bio: string;
  photo_url?: string | null;
  display_order: number;
  is_active?: boolean;
};

export type HonorableFormField = {
  field_key: string;
  label: string;
  field_type: string;
  placeholder?: string;
  help_text?: string;
  required?: boolean;
  display_order?: number;
  options?: { value: string; label: string }[];
  validation_config?: Record<string, unknown>;
};

type Envelope<T> = { success: boolean; data: T };

export const honorableAdvisoryService = {
  fetchMembers: async () => {
    const res = await apiClient<Envelope<{ results: HonorableAdvisoryMember[] }>>(`${BASE}/public/members/`);
    return res.data.results;
  },

  fetchFormFields: async () => {
    const res = await apiClient<Envelope<{ fields: HonorableFormField[] }>>(`${BASE}/public/form/`);
    return res.data.fields;
  },

  submitApplication: async (formData: FormData) => {
    const fieldValues: Record<string, any> = {};
    formData.forEach((val, key) => {
      if (key === 'field_values') {
        Object.assign(fieldValues, JSON.parse(val.toString()));
      } else {
        fieldValues[key] = val;
      }
    });
    return apiClient<Envelope<{ reference_id: string; status: string }>>(`${BASE}/public/apply/`, {
      method: "POST",
      body: { field_values: fieldValues },
    });
  },
};

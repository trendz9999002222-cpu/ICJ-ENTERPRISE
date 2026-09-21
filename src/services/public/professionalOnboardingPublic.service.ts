import { apiClient, apiClientFormData } from "@/lib/api/client";
import type {
  ProfessionConfiguration,
  PublicSelectable,
} from "@/types/public/professionalOnboardingPublic";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

const BASE = "/professional-onboarding";

async function getData<T>(path: string): Promise<T> {
  const res = await apiClient<ApiEnvelope<T>>(path);
  return res.data;
}

export const professionalOnboardingPublicService = {
  async fetchCategories(): Promise<PublicSelectable[]> {
    const data = await getData<{ results: PublicSelectable[] }>(`${BASE}/categories/`);
    return data.results;
  },

  async fetchGroups(categoryId: string): Promise<PublicSelectable[]> {
    const data = await getData<{ results: PublicSelectable[] }>(
      `${BASE}/categories/${categoryId}/groups/`,
    );
    return data.results;
  },

  async fetchProfessions(groupId: string): Promise<PublicSelectable[]> {
    const data = await getData<{ results: PublicSelectable[] }>(
      `${BASE}/groups/${groupId}/professions/`,
    );
    return data.results;
  },

  async fetchProfessionConfiguration(professionId: string): Promise<ProfessionConfiguration> {
    return getData<ProfessionConfiguration>(`${BASE}/professions/${professionId}/configuration/`);
  },

  async submitRegistration(payload: {
    categoryIds: string[];
    groupIds: string[];
    professionIds: string[];
    commonValues: Record<string, unknown>;
    professionValuesByProfession: Record<string, Record<string, unknown>>;
    files: Record<string, File | null>;
    idempotencyKey?: string;
  }): Promise<{ referenceId: string; status: string }> {
    const formData = new FormData();
    formData.set("category_ids", JSON.stringify(payload.categoryIds));
    formData.set("group_ids", JSON.stringify(payload.groupIds));
    formData.set("profession_ids", JSON.stringify(payload.professionIds));
    formData.set("common_field_values", JSON.stringify(payload.commonValues));
    formData.set("profession_field_values", JSON.stringify(payload.professionValuesByProfession));

    Object.entries(payload.files).forEach(([documentKey, file]) => {
      if (file) formData.append(`document__${documentKey}`, file);
    });

    if (payload.idempotencyKey) {
      formData.set("idempotency_key", payload.idempotencyKey);
    }

    const res = await apiClientFormData<
      ApiEnvelope<{ reference_id: string; status: string; submitted_at?: string }>
    >(`${BASE}/register/`, {
      method: "POST",
      formData,
    });

    return { referenceId: res.data.reference_id, status: res.data.status };
  },
};

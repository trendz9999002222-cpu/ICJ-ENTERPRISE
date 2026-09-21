import { ApiError, apiClient, readAccessTokenFromCookie } from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CommonField,
  FieldOption,
  OnboardingCategory,
  OnboardingDocument,
  OnboardingGroup,
  OnboardingListParams,
  OnboardingProfession,
  Paginated,
  ProfessionDocument,
  ProfessionField,
} from "@/types/admin/professionalOnboarding";
import type { ThemeEditorState, VisualThemeApiPayload } from "@/types/admin/visualTheme";

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

function buildQuery(params?: OnboardingListParams): string {
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

async function list<T>(path: string, params?: OnboardingListParams): Promise<Paginated<T>> {
  return request<Paginated<T>>(`${path}${buildQuery(params)}`);
}

export function getOnboardingApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError && err.body && typeof err.body === "object") {
    const body = err.body as { message?: string };
    if (body.message) return body.message;
  }
  if (err instanceof Error && err.message === "Not authenticated") {
    return "Please sign in as an administrator.";
  }
  return fallback;
}

export const professionalOnboardingService = {
  async getDashboardCounts(): Promise<{
    categories: number;
    groups: number;
    professions: number;
    commonFields: number;
    professionFields: number;
    documents: number;
  }> {
    const pageSize = 1;
    const [
      categories,
      groups,
      professions,
      commonFields,
      professionFields,
      documents,
    ] = await Promise.all([
      list<OnboardingCategory>(API_ENDPOINTS.adminProfessionalOnboarding.categories, {
        page: 1,
        page_size: pageSize,
      }),
      list<OnboardingGroup>(API_ENDPOINTS.adminProfessionalOnboarding.groups, {
        page: 1,
        page_size: pageSize,
      }),
      list<OnboardingProfession>(API_ENDPOINTS.adminProfessionalOnboarding.professions, {
        page: 1,
        page_size: pageSize,
      }),
      list<CommonField>(API_ENDPOINTS.adminProfessionalOnboarding.commonFields, {
        page: 1,
        page_size: pageSize,
      }),
      list<ProfessionField>(API_ENDPOINTS.adminProfessionalOnboarding.professionFieldsList, {
        page: 1,
        page_size: pageSize,
      }),
      list<OnboardingDocument>(API_ENDPOINTS.adminProfessionalOnboarding.documents, {
        page: 1,
        page_size: pageSize,
      }),
    ]);
    return {
      categories: categories.count,
      groups: groups.count,
      professions: professions.count,
      commonFields: commonFields.count,
      professionFields: professionFields.count,
      documents: documents.count,
    };
  },

  listCategories: (params?: OnboardingListParams) =>
    list<OnboardingCategory>(API_ENDPOINTS.adminProfessionalOnboarding.categories, params),
  getCategory: (id: string) =>
    request<OnboardingCategory>(API_ENDPOINTS.adminProfessionalOnboarding.category(id)),
  createCategory: (body: Partial<OnboardingCategory>) =>
    request<OnboardingCategory>(API_ENDPOINTS.adminProfessionalOnboarding.categories, {
      method: "POST",
      body,
    }),
  updateCategory: (id: string, body: Partial<OnboardingCategory>) =>
    request<OnboardingCategory>(API_ENDPOINTS.adminProfessionalOnboarding.category(id), {
      method: "PATCH",
      body,
    }),
  deleteCategory: (id: string) =>
    request<null>(API_ENDPOINTS.adminProfessionalOnboarding.category(id), { method: "DELETE" }),

  listGroups: (params?: OnboardingListParams) =>
    list<OnboardingGroup>(API_ENDPOINTS.adminProfessionalOnboarding.groups, params),
  createGroup: (body: Partial<OnboardingGroup>) =>
    request<OnboardingGroup>(API_ENDPOINTS.adminProfessionalOnboarding.groups, {
      method: "POST",
      body,
    }),
  updateGroup: (id: string, body: Partial<OnboardingGroup>) =>
    request<OnboardingGroup>(API_ENDPOINTS.adminProfessionalOnboarding.group(id), {
      method: "PATCH",
      body,
    }),
  deleteGroup: (id: string) =>
    request<null>(API_ENDPOINTS.adminProfessionalOnboarding.group(id), { method: "DELETE" }),

  listProfessions: (params?: OnboardingListParams) =>
    list<OnboardingProfession>(API_ENDPOINTS.adminProfessionalOnboarding.professions, params),
  getProfession: (id: string) =>
    request<OnboardingProfession>(API_ENDPOINTS.adminProfessionalOnboarding.profession(id)),
  createProfession: (body: Partial<OnboardingProfession>) =>
    request<OnboardingProfession>(API_ENDPOINTS.adminProfessionalOnboarding.professions, {
      method: "POST",
      body,
    }),
  updateProfession: (id: string, body: Partial<OnboardingProfession>) =>
    request<OnboardingProfession>(API_ENDPOINTS.adminProfessionalOnboarding.profession(id), {
      method: "PATCH",
      body,
    }),
  deleteProfession: (id: string) =>
    request<null>(API_ENDPOINTS.adminProfessionalOnboarding.profession(id), { method: "DELETE" }),

  listCommonFields: (params?: OnboardingListParams) =>
    list<CommonField>(API_ENDPOINTS.adminProfessionalOnboarding.commonFields, params),
  createCommonField: (body: Partial<CommonField>) =>
    request<CommonField>(API_ENDPOINTS.adminProfessionalOnboarding.commonFields, {
      method: "POST",
      body,
    }),
  updateCommonField: (id: string, body: Partial<CommonField>) =>
    request<CommonField>(API_ENDPOINTS.adminProfessionalOnboarding.commonField(id), {
      method: "PATCH",
      body,
    }),
  deleteCommonField: (id: string) =>
    request<null>(API_ENDPOINTS.adminProfessionalOnboarding.commonField(id), { method: "DELETE" }),

  listProfessionFields: (params?: OnboardingListParams) =>
    list<ProfessionField>(API_ENDPOINTS.adminProfessionalOnboarding.professionFieldsList, params),
  createProfessionField: (body: Partial<ProfessionField>) =>
    request<ProfessionField>(API_ENDPOINTS.adminProfessionalOnboarding.professionFieldsList, {
      method: "POST",
      body,
    }),
  updateProfessionField: (id: string, body: Partial<ProfessionField>) =>
    request<ProfessionField>(API_ENDPOINTS.adminProfessionalOnboarding.professionField(id), {
      method: "PATCH",
      body,
    }),
  deleteProfessionField: (id: string) =>
    request<null>(API_ENDPOINTS.adminProfessionalOnboarding.professionField(id), {
      method: "DELETE",
    }),

  listFieldOptions: (params?: OnboardingListParams) =>
    list<FieldOption>(API_ENDPOINTS.adminProfessionalOnboarding.fieldOptions, params),
  createFieldOption: (body: Partial<FieldOption>) =>
    request<FieldOption>(API_ENDPOINTS.adminProfessionalOnboarding.fieldOptions, {
      method: "POST",
      body,
    }),
  updateFieldOption: (id: string, body: Partial<FieldOption>) =>
    request<FieldOption>(API_ENDPOINTS.adminProfessionalOnboarding.fieldOption(id), {
      method: "PATCH",
      body,
    }),
  deleteFieldOption: (id: string) =>
    request<null>(API_ENDPOINTS.adminProfessionalOnboarding.fieldOption(id), { method: "DELETE" }),

  listDocuments: (params?: OnboardingListParams) =>
    list<OnboardingDocument>(API_ENDPOINTS.adminProfessionalOnboarding.documents, params),
  createDocument: (body: Partial<OnboardingDocument>) =>
    request<OnboardingDocument>(API_ENDPOINTS.adminProfessionalOnboarding.documents, {
      method: "POST",
      body,
    }),
  updateDocument: (id: string, body: Partial<OnboardingDocument>) =>
    request<OnboardingDocument>(API_ENDPOINTS.adminProfessionalOnboarding.document(id), {
      method: "PATCH",
      body,
    }),
  deleteDocument: (id: string) =>
    request<null>(API_ENDPOINTS.adminProfessionalOnboarding.document(id), { method: "DELETE" }),

  listProfessionDocuments: (params?: OnboardingListParams) =>
    list<ProfessionDocument>(
      API_ENDPOINTS.adminProfessionalOnboarding.professionDocumentsList,
      params,
    ),
  createProfessionDocument: (body: Partial<ProfessionDocument>) =>
    request<ProfessionDocument>(
      API_ENDPOINTS.adminProfessionalOnboarding.professionDocumentsList,
      { method: "POST", body },
    ),
  updateProfessionDocument: (id: string, body: Partial<ProfessionDocument>) =>
    request<ProfessionDocument>(API_ENDPOINTS.adminProfessionalOnboarding.professionDocument(id), {
      method: "PATCH",
      body,
    }),
  deleteProfessionDocument: (id: string) =>
    request<null>(API_ENDPOINTS.adminProfessionalOnboarding.professionDocument(id), {
      method: "DELETE",
    }),

  getCategoryTheme: (id: string) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.categoryTheme(id)),
  saveCategoryTheme: (id: string, body: Partial<ThemeEditorState>) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.categoryTheme(id), {
      method: "PATCH",
      body,
    }),
  resetCategoryTheme: (id: string) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.categoryTheme(id), {
      method: "DELETE",
    }),

  getGroupTheme: (id: string) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.groupTheme(id)),
  saveGroupTheme: (id: string, body: Partial<ThemeEditorState>) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.groupTheme(id), {
      method: "PATCH",
      body,
    }),
  resetGroupTheme: (id: string) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.groupTheme(id), {
      method: "DELETE",
    }),

  getProfessionTheme: (id: string) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.professionTheme(id)),
  saveProfessionTheme: (id: string, body: Partial<ThemeEditorState>) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.professionTheme(id), {
      method: "PATCH",
      body,
    }),
  resetProfessionTheme: (id: string) =>
    request<VisualThemeApiPayload>(API_ENDPOINTS.adminProfessionalOnboarding.professionTheme(id), {
      method: "DELETE",
    }),

  getProfessionResolvedTheme: (id: string) =>
    request<{
      resolved: VisualThemeApiPayload["resolved"];
      resolved_source: VisualThemeApiPayload["resolved_source"];
      use_parent_theme: boolean;
    }>(API_ENDPOINTS.adminProfessionalOnboarding.professionThemeResolved(id)),

  listRegistrations: (params?: OnboardingListParams & { status?: string }) =>
    list<{
      id: string;
      reference_id: string;
      applicant_name: string;
      email: string;
      categories: string[];
      groups: string[];
      professions: string[];
      status: string;
      created_at: string;
    }>(API_ENDPOINTS.adminProfessionalOnboarding.registrations, params),

  getRegistration: (id: string) =>
    request<Record<string, unknown>>(API_ENDPOINTS.adminProfessionalOnboarding.registration(id)),
};

export const API_ENDPOINTS = {
  health: "/health/",
  auth: {
    login: "/auth/login/",
    refresh: "/auth/refresh/",
    register: "/auth/register/",
    me: "/auth/me/",
    changePassword: "/auth/change-password/",
  },
  members: "/members/",
  professionalOnboardingPublic: {
    base: "/professional-onboarding/",
    categories: "/professional-onboarding/categories/",
    categoryGroups: (categoryId: string) =>
      `/professional-onboarding/categories/${categoryId}/groups/`,
    groupProfessions: (groupId: string) =>
      `/professional-onboarding/groups/${groupId}/professions/`,
    professionConfiguration: (professionId: string) =>
      `/professional-onboarding/professions/${professionId}/configuration/`,
    submissions: "/professional-onboarding/submissions/",
    register: "/professional-onboarding/register/",
  },
  onboarding: {
    advocateSubmit: "/onboarding/advocate/",
    adminAdvocates: "/onboarding/admin/advocates/",
    adminAdvocateDetail: (id: string) => `/onboarding/admin/advocates/${id}/`,
    adminAdvocateApprove: (id: string) => `/onboarding/admin/advocates/${id}/approve/`,
    adminAdvocateReject: (id: string) => `/onboarding/admin/advocates/${id}/reject/`,
  },
  adminProfessionalOnboarding: {
    base: "/admin/professional-onboarding/",
    categories: "/admin/professional-onboarding/categories/",
    category: (id: string) => `/admin/professional-onboarding/categories/${id}/`,
    categoryTheme: (id: string) => `/admin/professional-onboarding/categories/${id}/theme/`,
    categoryGroups: (categoryId: string) =>
      `/admin/professional-onboarding/categories/${categoryId}/groups/`,
    groups: "/admin/professional-onboarding/groups/",
    group: (id: string) => `/admin/professional-onboarding/groups/${id}/`,
    groupTheme: (id: string) => `/admin/professional-onboarding/groups/${id}/theme/`,
    groupProfessions: (groupId: string) =>
      `/admin/professional-onboarding/groups/${groupId}/professions/`,
    professions: "/admin/professional-onboarding/professions/",
    profession: (id: string) => `/admin/professional-onboarding/professions/${id}/`,
    professionTheme: (id: string) => `/admin/professional-onboarding/professions/${id}/theme/`,
    professionThemeResolved: (id: string) =>
      `/admin/professional-onboarding/professions/${id}/theme/resolved/`,
    professionFields: (professionId: string) =>
      `/admin/professional-onboarding/professions/${professionId}/fields/`,
    professionDocuments: (professionId: string) =>
      `/admin/professional-onboarding/professions/${professionId}/documents/`,
    commonFields: "/admin/professional-onboarding/common-fields/",
    commonField: (id: string) => `/admin/professional-onboarding/common-fields/${id}/`,
    commonFieldOptions: (fieldId: string) =>
      `/admin/professional-onboarding/common-fields/${fieldId}/options/`,
    professionFieldsList: "/admin/professional-onboarding/profession-fields/",
    professionField: (id: string) => `/admin/professional-onboarding/profession-fields/${id}/`,
    professionFieldOptions: (fieldId: string) =>
      `/admin/professional-onboarding/profession-fields/${fieldId}/options/`,
    fieldOptions: "/admin/professional-onboarding/field-options/",
    fieldOption: (id: string) => `/admin/professional-onboarding/field-options/${id}/`,
    documents: "/admin/professional-onboarding/documents/",
    document: (id: string) => `/admin/professional-onboarding/documents/${id}/`,
    professionDocumentsList: "/admin/professional-onboarding/profession-documents/",
    professionDocument: (id: string) =>
      `/admin/professional-onboarding/profession-documents/${id}/`,
    registrations: "/admin/professional-onboarding/registrations/",
    registration: (id: string) => `/admin/professional-onboarding/registrations/${id}/`,
  },
} as const;

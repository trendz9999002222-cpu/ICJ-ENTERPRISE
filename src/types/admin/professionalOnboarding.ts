export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "file"
  | "country"
  | "state"
  | "district"
  | "city";

export type OnboardingCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
  theme_primary_color?: string;
  theme_is_custom?: boolean;
  created_at: string;
  updated_at: string;
};

export type OnboardingGroup = {
  id: string;
  category: string;
  category_name: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
  theme_primary_color?: string;
  theme_is_custom?: boolean;
  theme_use_parent_theme?: boolean;
  created_at: string;
  updated_at: string;
};

export type OnboardingProfession = {
  id: string;
  group: string;
  group_name: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  display_order: number;
  theme_primary_color?: string;
  theme_is_custom?: boolean;
  theme_use_parent_theme?: boolean;
  created_at: string;
  updated_at: string;
};

export type FieldOptionDraft = {
  id?: string;
  value: string;
  label: string;
  display_order?: number;
  is_active?: boolean;
};

export type CommonField = {
  id: string;
  name: string;
  field_key: string;
  field_type: FieldType;
  label: string;
  placeholder: string;
  help_text: string;
  description: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  options?: (FieldOption | FieldOptionDraft)[];
  created_at: string;
  updated_at: string;
};

export type ProfessionField = {
  id: string;
  profession: string;
  profession_name: string;
  name: string;
  field_key: string;
  field_type: FieldType;
  label: string;
  placeholder: string;
  help_text: string;
  description: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  options?: (FieldOption | FieldOptionDraft)[];
  created_at: string;
  updated_at: string;
};

export type FieldOption = {
  id: string;
  common_field: string | null;
  profession_field: string | null;
  value: string;
  label: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};


export type OnboardingDocument = {
  id: string;
  name: string;
  document_key: string;
  description: string;
  allowed_file_types: string[];
  max_file_size_mb: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
};

export type ProfessionDocument = {
  id: string;
  profession: string;
  profession_name: string;
  document: string;
  document_name: string;
  document_key: string;
  is_required: boolean;
  is_active: boolean;
  display_order: number;
  instructions: string;
  created_at: string;
  updated_at: string;
};

export type OnboardingListParams = {
  search?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  category?: string;
  group?: string;
  profession?: string;
  common_field?: string;
  profession_field?: string;
  field_type?: string;
};

export type Paginated<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

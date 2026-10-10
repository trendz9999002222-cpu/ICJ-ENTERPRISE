export type FieldOption = {
  id?: string;
  value: string;
  label: string;
  display_order: number;
  is_active: boolean;
};

export type CommonField = {
  id: string;
  name: string;
  field_key: string;
  field_type: string;
  label: string;
  placeholder: string;
  help_text: string;
  description: string;
  default_value: string;
  validation_rules: any;
  options: FieldOption[];
  is_system_field: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type FormFieldConfig = {
  id: string;
  form: string;
  common_field: string;
  common_field_details?: CommonField;
  section_name: string;
  display_order: number;
  is_visible: boolean;
  is_required: boolean;
  label_override: string;
  placeholder_override: string;
  help_text_override: string;
  validation_overrides: any;
  created_at: string;
  updated_at: string;
};

export type CoreOnboardingListParams = {
  search?: string;
  is_active?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
  form_code?: string;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

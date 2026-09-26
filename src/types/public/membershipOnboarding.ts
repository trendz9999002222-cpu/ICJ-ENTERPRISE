export type MembershipOnboardingField = {
  id: string;
  field_key: string;
  field_type: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  description?: string;
  default_value?: string;
  validation_config?: Record<string, unknown>;
  required: boolean;
  display_order: number;
  options: { id: string; value: string; label: string; display_order: number }[];
};

export type MembershipOnboardingStep = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  display_order: number;
  is_required?: boolean;
  step_fields: MembershipOnboardingField[];
};

export type MembershipOnboardingDocument = {
  id: string;
  name: string;
  document_key: string;
  document_type?: string;
  is_required: boolean;
  allowed_extensions: string[];
  max_file_size_mb: number;
  display_order: number;
  instructions?: string;
};

export type MembershipTypePublic = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order: number;
};

export type MembershipOnboardingConfiguration = {
  membership_type?: MembershipTypePublic | null;
  form: { id: string; title: string; version: number; is_active: boolean } | null;
  steps: MembershipOnboardingStep[];
  documents: MembershipOnboardingDocument[];
};

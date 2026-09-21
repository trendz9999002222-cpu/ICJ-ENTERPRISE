import type { Theme } from "@/types/registration";

export type PublicSelectable = {
  id: string;
  title: string;
  description?: string;
  slug?: string;
  display_order?: number;
  theme?: Theme;
};

export type PublicGroupSelectable = PublicSelectable & { categoryId: string };

export type PublicProfessionSelectable = PublicSelectable & { groupId: string };

export type PublicFieldOption = {
  value: string;
  label: string;
  display_order: number;
};

export type PublicOnboardingField = {
  id: string;
  field_key: string;
  field_type: string;
  label: string;
  placeholder?: string;
  help_text?: string;
  is_required: boolean;
  display_order: number;
  options: PublicFieldOption[];
};

export type PublicOnboardingDocument = {
  id: string;
  name: string;
  document_key: string;
  is_required: boolean;
  display_order: number;
  instructions?: string;
  allowed_file_types: string[];
  max_file_size_mb: number;
};

export type ProfessionConfiguration = {
  category: { id: string; name: string };
  group: { id: string; name: string };
  profession: { id: string; name: string; description?: string };
  theme: Theme & {
    resolved?: Record<string, string>;
    resolved_source?: string;
  };
  common_fields: PublicOnboardingField[];
  profession_fields: PublicOnboardingField[];
  documents: PublicOnboardingDocument[];
};

/**
 * Types that describe the shape of data/registration.json.
 * The same shape is what your backend should eventually return.
 */

export type StepId =
  | "category"
  | "group"
  | "profession"
  | "association"
  | "specialisation"
  | "details"
  | "documents"
  | "review";

export type StepMeta = { title: string; subtitle: string };

export type Theme = { color: string; bg: string; border: string };

export type IconKey =
  | "gavel"
  | "handshake"
  | "chart"
  | "lightbulb"
  | "search"
  | "home"
  | "document"
  | "bank"
  | "laptop"
  | "people"
  | "person"
  | "library"
  | "work"
  | "school"
  | "more"
  | "translate"
  | "folder"
  | "assignment"
  | "volunteer"
  | "elderly"
  | "shield"
  | "storage"
  | "settings"
  | "headset";

export type FieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "year"
  | "select"
  | "radio"
  | "checkbox"
  | "checkboxGroup"
  | "country"
  | "state"
  | "city";

export type VisibleWhen = { field: string; equals?: string; oneOf?: string[] };

export type FormField = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  optionalTag?: boolean;
  placeholder?: string;
  helper?: string;
  prefix?: string;
  rows?: number;
  /** Column span out of 12 on desktop. Always full width on mobile. */
  col?: number;
  /** Inner columns for checkboxGroup / radio layouts. */
  columns?: number;
  options?: string[];
  optionItems?: { value: string; label: string }[];
  optionsRef?: string;
  yearFrom?: number;
  pattern?: string;
  patternMessage?: string;
  minLength?: number;
  maxLength?: number;
  visibleWhen?: VisibleWhen;
};

export type FormSection = {
  id: string;
  title: string;
  icon?: IconKey;
  description?: string;
  fields: FormField[];
};

export type DocumentField = {
  name: string;
  label: string;
  required?: boolean;
  accept?: string;
  hint?: string;
  maxSizeMb?: number;
};

export type FormSchema = {
  sections: FormSection[];
  documents: DocumentField[];
};

export type Sidebar = {
  guidelines: string[];
  whyRegister: string[];
  security: string;
};

export type SelectableOption = {
  id: string;
  title: string;
  description?: string;
};

export type Group = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: IconKey;
  theme: Theme;
  formId: string;
  sidebarId: string;
  steps: StepId[];
  professions: SelectableOption[];
  specialisations: SelectableOption[];
};

export type Category = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: IconKey;
  theme: Theme;
  groups: Group[];
};

export type RegistrationConfig = {
  stepCatalog: Record<StepId, StepMeta>;
  defaultSteps: StepId[];
  sidebars: Record<string, Sidebar>;
  optionSets: Record<string, string[]>;
  forms: Record<string, FormSchema>;
  categories: Category[];
};

/** Runtime state of the whole flow. */
export type RegistrationState = {
  categoryIds: string[];
  groupIds: string[];
  professionIds: string[];
  associationId: string | null;
  specialisationId: string | null;
  values: Record<string, unknown>;
  files: Record<string, File | null>;
  password: string;
  confirmPassword: string;
  declarationAgreed: boolean;
};

export const INITIAL_REGISTRATION_STATE: RegistrationState = {
  categoryIds: [],
  groupIds: [],
  professionIds: [],
  associationId: null,
  specialisationId: null,
  values: {},
  files: {},
  password: "",
  confirmPassword: "",
  declarationAgreed: false,
};

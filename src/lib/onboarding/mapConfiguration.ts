import type { ProfessionConfiguration, PublicOnboardingField } from "@/types/public/professionalOnboardingPublic";
import type { DocumentField, FormField, FormSchema, FormSection } from "@/types/registration";

const CATEGORY_ICONS = [
  "gavel",
  "handshake",
  "chart",
  "lightbulb",
  "search",
  "home",
  "document",
  "bank",
  "laptop",
  "people",
] as const;

export function iconForIndex(index: number): (typeof CATEGORY_ICONS)[number] {
  return CATEGORY_ICONS[index % CATEGORY_ICONS.length];
}

function mapFieldType(field: PublicOnboardingField): FormField["type"] {
  if (field.field_type === "checkbox" && field.options?.length) return "checkboxGroup";
  const fieldType = field.field_type;
  if (fieldType === "phone") return "tel";
  if (fieldType === "email") return "email";
  if (fieldType === "textarea") return "textarea";
  if (fieldType === "number") return "number";
  if (fieldType === "date") return "date";
  if (fieldType === "select") return "select";
  if (fieldType === "radio") return "radio";
  if (fieldType === "checkbox") return "checkbox";
  if (fieldType === "country") return "country";
  if (fieldType === "state") return "state";
  if (fieldType === "city") return "city";
  return "text";
}

function mapApiField(field: PublicOnboardingField): FormField {
  const optionItems = field.options?.length
    ? field.options.map((o) => ({ value: o.value, label: o.label }))
    : undefined;

  return {
    name: field.field_key,
    label: field.label,
    type: mapFieldType(field),
    required: field.is_required,
    placeholder: field.placeholder,
    helper: field.help_text,
    col: field.field_type === "textarea" ? 12 : 4,
    optionItems,
    options: optionItems?.map((o) => o.label),
  };
}

export function configurationToFormSchema(config: ProfessionConfiguration | null): FormSchema | null {
  if (!config) return null;

  const commonSection: FormSection = {
    id: "common",
    title: "Common information",
    icon: "person",
    fields: config.common_fields.map(mapApiField),
  };

  const professionSection: FormSection = {
    id: "profession",
    title: "Professional information",
    icon: "work",
    fields: config.profession_fields.map(mapApiField),
  };

  const sections = [commonSection, professionSection].filter((s) => s.fields.length > 0);

  const documents: DocumentField[] = config.documents.map((doc) => ({
    name: doc.document_key,
    label: doc.name,
    required: doc.is_required,
    hint: doc.instructions,
    maxSizeMb: doc.max_file_size_mb,
    accept: doc.allowed_file_types.map((t) => `.${t.replace(/^\./, "")}`).join(","),
  }));

  return { sections, documents };
}

export const professionFieldStorageKey = (professionId: string, fieldKey: string) =>
  `prof:${professionId}:${fieldKey}`;

export function isProfessionScopedFieldName(name: string): boolean {
  return name.startsWith("prof:");
}

export function submissionFilesForConfig(
  files: Record<string, File | null>,
  documentKeys: string[],
): Record<string, File | null> {
  const allowed = new Set(documentKeys);
  const out: Record<string, File | null> = {};
  for (const [key, file] of Object.entries(files)) {
    if (allowed.has(key) && file) out[key] = file;
  }
  return out;
}

export function extractProfessionFieldValues(
  professionId: string,
  values: Record<string, unknown>,
  fieldKeys: string[],
  /** When true (multi-profession flow), always read scoped keys. */
  forceScoped = false,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const useScoped =
    forceScoped ||
    fieldKeys.some((key) =>
      Object.prototype.hasOwnProperty.call(values, professionFieldStorageKey(professionId, key)),
    );
  for (const key of fieldKeys) {
    const storageKey = useScoped ? professionFieldStorageKey(professionId, key) : key;
    if (Object.prototype.hasOwnProperty.call(values, storageKey)) {
      out[key] = values[storageKey];
    }
  }
  return out;
}

/** Merge onboarding configs when the user selects multiple professions. */
export function mergeConfigurationsToFormSchema(
  configs: ProfessionConfiguration[],
): FormSchema | null {
  if (!configs.length) return null;
  if (configs.length === 1) {
    return configurationToFormSchema(configs[0]);
  }

  const commonByKey = new Map<string, FormField>();
  for (const config of configs) {
    for (const field of config.common_fields) {
      if (!commonByKey.has(field.field_key)) {
        commonByKey.set(field.field_key, mapApiField(field));
      }
    }
  }

  const sections: FormSection[] = [];
  if (commonByKey.size) {
    sections.push({
      id: "common",
      title: "Common information",
      icon: "person",
      fields: [...commonByKey.values()],
    });
  }

  for (const config of configs) {
    if (!config.profession_fields.length) continue;
    sections.push({
      id: `profession-${config.profession.id}`,
      title: `Professional information — ${config.profession.name}`,
      icon: "work",
      fields: config.profession_fields.map((field) => {
        const mapped = mapApiField(field);
        return {
          ...mapped,
          name: professionFieldStorageKey(config.profession.id, field.field_key),
        };
      }),
    });
  }

  const documentsByKey = new Map<string, DocumentField>();
  for (const config of configs) {
    for (const doc of config.documents) {
      const existing = documentsByKey.get(doc.document_key);
      const mapped: DocumentField = {
        name: doc.document_key,
        label: doc.name,
        required: doc.is_required,
        hint: doc.instructions,
        maxSizeMb: doc.max_file_size_mb,
        accept: doc.allowed_file_types.map((t) => `.${t.replace(/^\./, "")}`).join(","),
      };
      if (!existing) {
        documentsByKey.set(doc.document_key, mapped);
      } else if (doc.is_required) {
        documentsByKey.set(doc.document_key, { ...existing, required: true });
      }
    }
  }

  return { sections, documents: [...documentsByKey.values()] };
}

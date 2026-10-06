import type { FieldType } from "@/types/admin/professionalOnboarding";

export const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Textarea" },
  { value: "number", label: "Number" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "date", label: "Date" },
  { value: "select", label: "Dropdown" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "file", label: "File" },
  { value: "country", label: "Country" },
  { value: "state", label: "State" },
  { value: "city", label: "City / District" },
];

export const OPTION_FIELD_TYPES: FieldType[] = ["select", "radio", "checkbox"];

export function slugFromName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function fieldKeyFromName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return base && /^[a-z]/.test(base) ? base : `field_${base || "item"}`;
}

import type { MembershipOnboardingField, MembershipOnboardingStep } from "@/types/public/membershipOnboarding";
import type { DocumentField, FormField, FormSchema, FormSection } from "@/types/registration";

function mapFieldType(field: MembershipOnboardingField): FormField["type"] {
  if (field.field_type === "checkbox" && field.options?.length) return "checkboxGroup";
  if (field.field_type === "multi_select") return "checkboxGroup";
  if (field.field_type === "searchable_dropdown" || field.field_type === "select") return "select";
  if (field.field_type === "phone") return "tel";
  if (field.field_type === "email") return "email";
  if (field.field_type === "textarea") return "textarea";
  if (field.field_type === "number" || field.field_type === "pincode") return "number";
  if (field.field_type === "date") return "date";
  if (field.field_type === "radio") return "radio";
  if (field.field_type === "checkbox") return "checkbox";
  return "text";
}

function mapField(field: MembershipOnboardingField): FormField {
  const optionItems = field.options?.length
    ? field.options.map((o) => ({ value: o.value, label: o.label }))
    : undefined;

  return {
    name: field.field_key,
    label: field.label,
    type: mapFieldType(field),
    required: field.required,
    placeholder: field.placeholder,
    helper: field.help_text,
    col: field.field_type === "textarea" ? 12 : 6,
    optionItems,
    options: optionItems?.map((o) => o.label),
  };
}

export function stepToFormSchema(step: MembershipOnboardingStep): FormSchema {
  const fileFields = step.step_fields.filter((f) => f.field_type === "file" || f.field_type === "image");
  const otherFields = step.step_fields.filter((f) => f.field_type !== "file" && f.field_type !== "image");

  const sections: FormSection[] = [];
  if (otherFields.length) {
    sections.push({
      id: step.slug,
      title: step.title,
      icon: "person",
      fields: otherFields.map(mapField),
    });
  }

  const documents: DocumentField[] = fileFields.map((f) => ({
    name: f.field_key,
    label: f.label,
    required: f.required,
    hint: f.help_text,
    maxSizeMb: 5,
    accept: ".pdf,.jpg,.jpeg,.png",
  }));

  return { sections, documents };
}

import type { DocumentField, FormField, FormSection, VisibleWhen } from "@/types/registration";

export type Errors = Record<string, string>;

/** A field is only validated when its visibility condition passes. */
export function isFieldVisible(rule: VisibleWhen | undefined, values: Record<string, unknown>): boolean {
  if (!rule) return true;
  const current = values[rule.field];
  if (rule.equals !== undefined) return current === rule.equals;
  if (rule.oneOf) return rule.oneOf.includes(String(current ?? ""));
  return true;
}

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "string") return value.trim() === "";
  if (typeof value === "boolean") return value === false;
  return false;
}

export function validateField(field: FormField, values: Record<string, unknown>): string | null {
  if (!isFieldVisible(field.visibleWhen, values)) return null;

  const value = values[field.name];

  if (field.required && isEmpty(value)) {
    return `${field.label} is required`;
  }

  if (isEmpty(value)) return null;

  const text = typeof value === "string" ? value.trim() : "";

  if (field.type === "email" && text && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text)) {
    return "Enter a valid email address";
  }

  if (field.type === "tel" && text) {
    // 10 digit number starting with 6, 7, 8 or 9
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(text.replace(/[\s\-]/g, ""))) {
      return "Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9";
    }
  }

  if (field.pattern && text && !new RegExp(field.pattern).test(text)) {
    return field.patternMessage ?? `${field.label} is not valid`;
  }

  if (field.minLength && text.length < field.minLength) {
    return `${field.label} must be at least ${field.minLength} characters`;
  }

  if (field.maxLength && text.length > field.maxLength) {
    return `${field.label} must be under ${field.maxLength} characters`;
  }

  return null;
}

export function validateSections(sections: FormSection[], values: Record<string, unknown>): Errors {
  const errors: Errors = {};
  sections.forEach((section) => {
    section.fields.forEach((field) => {
      const message = validateField(field, values);
      if (message) errors[field.name] = message;
    });
  });
  return errors;
}

export function validateDocuments(docs: DocumentField[], files: Record<string, File | null>): Errors {
  const errors: Errors = {};
  docs.forEach((doc) => {
    const file = files[doc.name];
    if (doc.required && !file) {
      errors[doc.name] = `${doc.label} is required`;
      return;
    }
    if (file && doc.maxSizeMb && file.size > doc.maxSizeMb * 1024 * 1024) {
      errors[doc.name] = `File must be under ${doc.maxSizeMb} MB`;
    }
  });
  return errors;
}

export function scrollToFirstError(errors: Errors) {
  const firstKey = Object.keys(errors)[0];
  if (!firstKey) return;
  const el = document.querySelector(`[data-field="${firstKey}"]`);
  el?.scrollIntoView({ behavior: "smooth", block: "center" });
}

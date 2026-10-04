export function validateConfiguredFieldList(fields: any[], values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = values[field.field_key] as string;
    
    // Required check
    if (field.required && (!value || !value.trim())) {
      errors[field.field_key] = `${field.label} is required`;
      continue;
    }

    if (!value || !value.trim()) continue;

    // Type validation
    if (field.field_type === "phone") {
      const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;
      if (!phoneRegex.test(value)) {
        errors[field.field_key] = "Please enter a valid phone number";
      }
    } else if (field.field_type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors[field.field_key] = "Please enter a valid email address";
      }
    }
  }

  return errors;
}

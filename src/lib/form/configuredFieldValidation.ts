export function validateConfiguredFieldList(fields: any[], values: Record<string, unknown>): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = values[field.field_key];
    
    // Required check
    if (field.required) {
      if (
        value === undefined || 
        value === null || 
        (typeof value === "string" && !value.trim()) ||
        // If it's a file but empty/null somehow (usually a file is an object, but just in case)
        (field.field_type === "file" && !(value instanceof File))
      ) {
        errors[field.field_key] = `${field.label} is required`;
        continue;
      }
    }

    if (value === undefined || value === null) continue;
    if (typeof value === "string" && !value.trim()) continue;
    
    // Type validation for strings
    if (typeof value === "string") {
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
  }

  return errors;
}

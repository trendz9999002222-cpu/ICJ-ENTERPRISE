// ICJ ENTERPRISE PLATFORM — STANDARD VALIDATION ENGINE (100% STRICT)
// Single Source of Truth for 10-Digit Mobile, RFC Email, 6-Digit Pincode across all modules

/**
 * Strict 10-digit Mobile Number Validation
 * Enforces exactly 10 digits (for India: starts with 6, 7, 8, or 9)
 */
export function validateStrictMobile(mobile = "", countryCode = "+91") {
  const digits = String(mobile).replace(/\D/g, "");
  
  if (digits.length === 0) {
    return { isValid: false, message: "Mobile number is required." };
  }
  
  if (countryCode === "+91" || !countryCode) {
    if (digits.length !== 10) {
      return { isValid: false, message: "Mobile number must be exactly 10 digits." };
    }
    if (!/^[6-9]\d{9}$/.test(digits)) {
      return { isValid: false, message: "Indian mobile number must start with 6, 7, 8, or 9." };
    }
    return { isValid: true, message: "Valid 10-digit mobile number." };
  }

  // International numbers
  if (digits.length < 7 || digits.length > 15) {
    return { isValid: false, message: "International phone number must be between 7 and 15 digits." };
  }
  return { isValid: true, message: "Valid phone number." };
}

/**
 * Sanitizes input to digits only, strictly capping at 10 digits for India
 */
export function sanitizeStrictMobile(value = "", countryCode = "+91") {
  const digits = String(value).replace(/\D/g, "");
  if (countryCode === "+91" || !countryCode) {
    return digits.slice(0, 10);
  }
  return digits.slice(0, 15);
}

/**
 * Strict RFC-compliant Email Validation
 */
export function validateStrictEmail(email = "") {
  const trimmed = String(email).trim();
  if (trimmed.length === 0) {
    return { isValid: false, message: "Email address is required." };
  }
  // Standard RFC 5322 regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: "Please enter a valid email address (e.g. name@domain.com)." };
  }
  return { isValid: true, message: "Valid email address." };
}

/**
 * Strict 6-digit Pincode Validation
 */
export function validateStrictPincode(pincode = "") {
  const digits = String(pincode).replace(/\D/g, "");
  if (digits.length !== 6) {
    return { isValid: false, message: "Pincode must be exactly 6 digits." };
  }
  return { isValid: true, message: "Valid 6-digit pincode." };
}

/**
 * Sanitizes input to digits only, strictly capping at 6 digits
 */
export function sanitizeStrictPincode(value = "") {
  return String(value).replace(/\D/g, "").slice(0, 6);
}

export default {
  validateStrictMobile,
  sanitizeStrictMobile,
  validateStrictEmail,
  validateStrictPincode,
  sanitizeStrictPincode,
};

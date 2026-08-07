import { REGISTRATION_PASSWORD_POLICY } from "../../config/auth.config";

export const normalizeIndianMobile = (value = "") => {
  const digits = String(value || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

export const isIndianMobile = (value = "") => /^[6-9]\d{9}$/.test(normalizeIndianMobile(value));

export const assertIndianMobile = (value = "") => {
  const normalized = normalizeIndianMobile(value);
  if (!isIndianMobile(normalized)) {
    throw new Error("Enter a valid Indian mobile number (10 digits). Example: 9876543210");
  }
  return normalized;
};

export const normalizeEmail = (value = "") => String(value || "").trim().toLowerCase();

export const isValidEmail = (value = "") =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/.test(normalizeEmail(value));

export const getPasswordPolicyMessage = () =>
  "Use 8-64 characters with uppercase, lowercase, number, and special character.";

export const isStrongPassword = (password = "") => {
  const value = String(password || "");
  const policy = REGISTRATION_PASSWORD_POLICY;
  if (value.length < policy.minLength || value.length > policy.maxLength) return false;
  if (policy.requiresUppercase && !/[A-Z]/.test(value)) return false;
  if (policy.requiresLowercase && !/[a-z]/.test(value)) return false;
  if (policy.requiresDigit && !/\d/.test(value)) return false;
  if (policy.requiresSpecialCharacter && !/[^A-Za-z0-9]/.test(value)) return false;
  return true;
};

export const assertStrongPassword = (password = "") => {
  if (!isStrongPassword(password)) {
    throw new Error(getPasswordPolicyMessage());
  }
  return String(password);
};

export const validateRegistrationForm = (form = {}) => {
  const errors = {};

  const fullName = String(form.fullName || "").trim();
  const email = normalizeEmail(form.email);
  const mobile = normalizeIndianMobile(form.mobile);
  const password = String(form.password || "");
  const confirmPassword = String(form.confirmPassword || "");

  if (!fullName) errors.fullName = "Full name is required.";
  if (!email) errors.email = "Email address is required.";
  else if (!isValidEmail(email)) errors.email = "Enter a valid email address.";

  if (!mobile) errors.mobile = "Mobile number is required.";
  else if (!isIndianMobile(mobile)) {
    errors.mobile = "Enter a valid Indian mobile number (10 digits).";
  }

  if (!password) errors.password = "Password is required.";
  else if (!isStrongPassword(password)) errors.password = getPasswordPolicyMessage();

  if (!confirmPassword) errors.confirmPassword = "Confirm your password.";
  else if (password !== confirmPassword) errors.confirmPassword = "Passwords do not match.";

  return errors;
};

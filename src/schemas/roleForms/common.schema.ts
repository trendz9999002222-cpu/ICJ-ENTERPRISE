import type { AddressContactData, PersonalInfoData } from "@/types/onboarding-form";
import { isValidPhoneNumber } from "libphonenumber-js/max";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export function validatePersonal(data: PersonalInfoData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.fullName || !data.fullName.trim()) {
    errors.fullName = "पूरा नाम दर्ज करना अनिवार्य है (Full Name is required).";
  } else if (data.fullName.trim().length < 2) {
    errors.fullName = "नाम कम से कम 2 अक्षरों का होना चाहिए (Name must be at least 2 characters).";
  }

  if (!data.gender) {
    errors.gender = "कृपया लिंग चुनें (Please select gender).";
  }

  if (!data.dateOfBirth) {
    errors.dateOfBirth = "जन्म तिथि अनिवार्य है (Date of Birth is required).";
  }

  const cleanMobile = data.mobile ? String(data.mobile).trim() : "";
  if (!cleanMobile) {
    errors.mobile = "मोबाइल नंबर दर्ज करना अनिवार्य है (Mobile number is required).";
  } else if (!isValidPhoneNumber(cleanMobile.startsWith("+") ? cleanMobile : `+91${cleanMobile.replace(/\D/g, "")}`, "IN")) {
    errors.mobile = "कृपया मान्य मोबाइल नंबर दर्ज करें (Valid mobile number required).";
  }

  if (data.email && data.email.trim()) {
    if (!EMAIL_REGEX.test(data.email.trim())) {
      errors.email = "कृपया मान्य ईमेल पता दर्ज करें (Please enter a valid email address).";
    }
  }

  return errors;
}

export function validateAddress(data: AddressContactData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.addressLine || !data.addressLine.trim()) {
    errors.addressLine = "पता दर्ज करना अनिवार्य है (Address Line is required).";
  }

  if (!data.state || !data.state.trim()) {
    errors.state = "कृपया राज्य का चयन करें (Please select state).";
  }

  if (!data.district || !data.district.trim()) {
    errors.district = "कृपया ज़िला चुनें (Please select district).";
  }

  if (!data.cityTehsil || !data.cityTehsil.trim()) {
    errors.cityTehsil = "शहर / तहसील दर्ज करना अनिवार्य है (City / Tehsil is required).";
  }

  const cleanPin = (data.pincode || "").replace(/\D/g, "");
  if (!cleanPin) {
    errors.pincode = "पिनकोड दर्ज करना अनिवार्य है (Pincode is required).";
  } else if (!PINCODE_REGEX.test(cleanPin)) {
    errors.pincode = "कृपया 6 अंकों का मान्य भारतीय पिनकोड दर्ज करें (Valid 6-digit Indian pincode required).";
  }

  if (data.alternateMobile && String(data.alternateMobile).trim()) {
    const cleanAlt = String(data.alternateMobile).trim();
    if (!isValidPhoneNumber(cleanAlt.startsWith("+") ? cleanAlt : `+91${cleanAlt.replace(/\D/g, "")}`, "IN")) {
      errors.alternateMobile = "कृपया मान्य मोबाइल नंबर दर्ज करें (Valid mobile number required).";
    }
  }

  return errors;
}

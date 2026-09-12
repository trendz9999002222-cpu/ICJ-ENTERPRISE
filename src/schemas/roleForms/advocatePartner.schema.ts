import type { AdvocateSpecificData, DocumentUploadsData, PersonalInfoData } from "@/types/onboarding-form";
import { EMAIL_REGEX } from "./common.schema";

const GRADUATION_YEAR_REGEX = /^(19|20)\d{2}$/;
const LINKEDIN_REGEX = /^(https?:\/\/)?([\w-]+\.)?linkedin\.com\/[\w\-/%]+$/i;

function phoneDigits(value: string): string {
  return (value || "").replace(/\D/g, "");
}

/** Advocate KYC: 10–15 digits (India or international). */
function isValidKycPhone(value: string): boolean {
  const digits = phoneDigits(value);
  return digits.length >= 10 && digits.length <= 15;
}

export function validateAdvocatePersonalKyc(data: PersonalInfoData, addressLine: string): Record<string, string> {
  const errors: Record<string, string> = {};

  const fullName = data.fullName?.trim() || "";
  if (!fullName) {
    errors.fullName = "Full legal name is required.";
  } else if (fullName.length < 2) {
    errors.fullName = "Name must be at least 2 characters.";
  }

  const email = data.email?.trim() || "";
  if (!email) {
    errors.email = "Email address is required.";
  } else if (!EMAIL_REGEX.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!isValidKycPhone(data.mobile || "")) {
    errors.mobile = "Enter a valid phone number (10–15 digits, with or without country code).";
  }

  const address = addressLine?.trim() || "";
  if (!address) {
    errors.addressLine = "Current residential address is required.";
  } else if (address.length < 10) {
    errors.addressLine = "Please enter a complete address (at least 10 characters).";
  }

  const linkedIn = data.linkedInPortfolio?.trim() || "";
  if (linkedIn && !LINKEDIN_REGEX.test(linkedIn) && !/^[\w.\-/]+$/.test(linkedIn)) {
    errors.linkedInPortfolio = "Enter a valid LinkedIn URL or profile path.";
  }

  return errors;
}

export function validateAdvocateEducation(data: AdvocateSpecificData): Record<string, string> {
  const errors: Record<string, string> = {};
  const currentYear = new Date().getFullYear();

  if (!data.lawSchool?.trim()) {
    errors.lawSchool = "Law school is required.";
  }

  const year = data.graduationYear?.trim() || "";
  if (!year) {
    errors.graduationYear = "Graduation year is required.";
  } else if (!GRADUATION_YEAR_REGEX.test(year)) {
    errors.graduationYear = "Enter a valid 4-digit graduation year (e.g. 2018).";
  } else {
    const y = Number(year);
    if (y < 1950 || y > currentYear + 1) {
      errors.graduationYear = `Year must be between 1950 and ${currentYear + 1}.`;
    }
  }

  if (!data.degreeEarned?.trim()) {
    errors.degreeEarned = "Degree earned is required.";
  }

  if (!data.barAdmissionRegion?.trim()) {
    errors.barAdmissionRegion = "Bar admission state / country is required.";
  }

  if (!data.barNumber?.trim()) {
    errors.barNumber = "Bar number / registration ID is required.";
  } else if (data.barNumber.trim().length < 3) {
    errors.barNumber = "Bar number must be at least 3 characters.";
  }

  if (!data.barAdmissionDate?.trim()) {
    errors.barAdmissionDate = "Date of admission is required.";
  } else {
    const admitted = new Date(data.barAdmissionDate);
    if (Number.isNaN(admitted.getTime())) {
      errors.barAdmissionDate = "Enter a valid date of admission.";
    } else if (admitted > new Date()) {
      errors.barAdmissionDate = "Date of admission cannot be in the future.";
    }
  }

  return errors;
}

export function validateAdvocateDetails(data: AdvocateSpecificData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.currentEmployer?.trim()) {
    errors.currentEmployer = "Current / most recent employer is required.";
  }

  if (!data.currentJobTitle?.trim()) {
    errors.currentJobTitle = "Current job title is required.";
  }

  if (!data.yearsOfExperience?.trim()) {
    errors.yearsOfExperience = "Select years of practice experience.";
  }

  const areas = Array.isArray(data.practiceAreas) ? data.practiceAreas : [];
  if (!areas.length) {
    errors.practiceAreas = "Select at least one primary area of practice.";
  }

  const bio = data.profileBio?.trim() || "";
  if (!bio) {
    errors.profileBio = "Practice experience summary is required.";
  } else if (bio.length < 30) {
    errors.profileBio = "Please provide at least 30 characters in your summary.";
  }

  return errors;
}

export function validateAdvocateDocs(docs: DocumentUploadsData): Record<string, string> {
  const errors: Record<string, string> = {};
  const required: { key: string; label: string }[] = [
    { key: "resumeDoc", label: "Resume / CV" },
    { key: "coverLetterDoc", label: "Cover letter" },
    { key: "barLicenseDoc", label: "Bar license certificate" },
    { key: "govtPhotoIdDoc", label: "Government photo ID" },
  ];

  for (const { key, label } of required) {
    if (!docs[key]) {
      errors[key] = `${label} is required for KYC verification.`;
    }
  }

  return errors;
}

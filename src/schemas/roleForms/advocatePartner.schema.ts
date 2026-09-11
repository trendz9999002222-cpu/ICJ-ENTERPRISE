import type { AdvocateSpecificData, DocumentUploadsData } from "@/types/onboarding-form";

export function validateAdvocateDetails(data: AdvocateSpecificData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.professionalType || !data.professionalType.trim()) {
    errors.professionalType = "कृपया पेशेवर श्रेणी चुनें (Please select professional type).";
  }

  const isAdvocate = data.professionalType.includes("Advocate");

  if (!data.regNumber || !data.regNumber.trim()) {
    errors.regNumber = isAdvocate
      ? "बार काउंसिल पंजीकरण संख्या अनिवार्य है (Bar Council Enrolment No. is required)."
      : "व्यावसायिक पंजीकरण संख्या अनिवार्य है (Professional Registration No. is required).";
  }

  if (isAdvocate && (!data.stateBarCouncil || !data.stateBarCouncil.trim())) {
    errors.stateBarCouncil = "राज्य बार काउंसिल का चयन करें (State Bar Council is required).";
  }

  if (!data.yearsOfExperience || !data.yearsOfExperience.trim()) {
    errors.yearsOfExperience = "कार्य अनुभव का चयन करें (Years of experience required).";
  }

  if (!data.practiceArea || !data.practiceArea.trim()) {
    errors.practiceArea = "अभ्यास / विशेषज्ञता का क्षेत्र अनिवार्य है (Practice/expertise area required).";
  }

  return errors;
}

export function validateAdvocateDocs(docs: DocumentUploadsData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!docs["barCertDoc"]) {
    errors["barCertDoc"] = "बार काउंसिल प्रमाण पत्र / पंजीकरण पत्र अनिवार्य है (Certificate of Practice / ID required).";
  }

  return errors;
}

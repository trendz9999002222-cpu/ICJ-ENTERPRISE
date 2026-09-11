import type { DocumentUploadsData, FranchiseSpecificData } from "@/types/onboarding-form";

export function validateFranchiseDetails(data: FranchiseSpecificData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.orgName || !data.orgName.trim()) {
    errors.orgName = "संस्था / फर्म / केंद्र का नाम अनिवार्य है (Organization/Center Name is required).";
  }

  if (!data.authorizedPerson || !data.authorizedPerson.trim()) {
    errors.authorizedPerson = "अधिकृत प्रतिनिधि का नाम अनिवार्य है (Authorized Person Name is required).";
  }

  if (!data.operatingDistrict || !data.operatingDistrict.trim()) {
    errors.operatingDistrict = "संचालन ज़िला चुनें (Operating District is required).";
  }

  if (!data.businessType || !data.businessType.trim()) {
    errors.businessType = "व्यवसाय का प्रकार चुनें (Business/Entity Type is required).";
  }

  if (!data.teamSize || !data.teamSize.trim()) {
    errors.teamSize = "टीम का आकार चुनें (Team Size is required).";
  }

  return errors;
}

export function validateFranchiseDocs(docs: DocumentUploadsData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!docs["businessProofDoc"]) {
    errors["businessProofDoc"] = "व्यावसायिक पंजीकरण / जीएसटी / संस्था प्रमाण पत्र अनिवार्य है (Business Registration / Incorporation required).";
  }

  return errors;
}

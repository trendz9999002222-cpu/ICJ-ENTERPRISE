import type { DocumentUploadsData, LitigantSpecificData } from "@/types/onboarding-form";

export function validateLitigantDetails(data: LitigantSpecificData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!data.matterType || !data.matterType.trim()) {
    errors.matterType = "कृपया विवाद का प्रकार चुनें (Please select case/matter type).";
  }

  if (!data.disputeNature || !data.disputeNature.trim()) {
    errors.disputeNature = "विवाद की संक्षिप्त प्रकृति दर्ज करें (Dispute nature/subject is required).";
  }

  if (!data.description || !data.description.trim()) {
    errors.description = "मामले का संक्षिप्त विवरण देना अनिवार्य है (Brief case description is required).";
  } else if (data.description.trim().length < 10) {
    errors.description = "कृपया मामले का थोड़ा और विवरण दें (कम से कम 10 अक्षर).";
  }

  if (!data.currentStatus || !data.currentStatus.trim()) {
    errors.currentStatus = "कृपया वर्तमान स्थिति चुनें (Current case status required).";
  }

  if (!data.preferredAssistance || !data.preferredAssistance.trim()) {
    errors.preferredAssistance = "अपेक्षित विधिक सहायता चुनें (Select required legal assistance).";
  }

  return errors;
}

export function validateLitigantDocs(docs: DocumentUploadsData): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!docs["aadhaarDoc"]) {
    errors["aadhaarDoc"] = "आधार कार्ड / पहचान पत्र अपलोड करना अनिवार्य है (Identity Proof is required).";
  }

  return errors;
}

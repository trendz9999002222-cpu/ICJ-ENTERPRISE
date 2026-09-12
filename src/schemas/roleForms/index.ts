import type { OnboardingFormState } from "@/types/onboarding-form";
import { validateAddress, validatePersonal } from "./common.schema";
import { validateLitigantDetails, validateLitigantDocs } from "./litigantClient.schema";
import {
  validateAdvocateDetails,
  validateAdvocateDocs,
  validateAdvocateEducation,
  validateAdvocatePersonalKyc,
} from "./advocatePartner.schema";
import { validateFranchiseDetails, validateFranchiseDocs } from "./districtFranchise.schema";

export function validateStep(step: number, state: OnboardingFormState): Record<string, string> {
  switch (step) {
    case 2:
      if (state.role === "advocate") {
        return validateAdvocatePersonalKyc(state.personal, state.address.addressLine);
      }
      return validatePersonal(state.personal);

    case 3:
      if (state.role === "advocate") {
        return validateAdvocateEducation(state.advocate);
      }
      return validateAddress(state.address);

    case 4:
      if (state.role === "citizen") {
        return validateLitigantDetails(state.litigant);
      }
      if (state.role === "advocate") {
        return validateAdvocateDetails(state.advocate);
      }
      if (state.role === "franchise") {
        return validateFranchiseDetails(state.franchise);
      }
      return {};

    case 5:
      if (state.role === "citizen") {
        return validateLitigantDocs(state.documents);
      }
      if (state.role === "advocate") {
        return validateAdvocateDocs(state.documents);
      }
      if (state.role === "franchise") {
        return validateFranchiseDocs(state.documents);
      }
      return {};

    case 6:
      if (!state.declarationAgreed) {
        return {
          declarationAgreed: "कृपया घोषणा पत्र स्वीकार करें (You must agree to the declaration before submitting).",
        };
      }
      return {};

    default:
      return {};
  }
}

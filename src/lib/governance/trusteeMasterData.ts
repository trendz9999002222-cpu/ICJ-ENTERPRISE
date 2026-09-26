import {
  APPOINTMENT_STATUSES,
  AREAS_OF_EXPERTISE,
  DESIGNATIONS,
  DOCUMENT_TYPES,
  GENDERS,
  GOVERNMENT_ID_TYPES,
  GOVERNING_BODY_TYPES,
  INDIAN_STATES_UT,
  LANGUAGES,
  NATIONALITIES,
  OCCUPATIONS,
  ORGANISATIONS_TRUST,
  PHONE_COUNTRY_CODES,
  PROFESSIONAL_REGISTRATION_TYPES,
  VERIFICATION_STATUSES,
  COUNTRIES,
  districtsForState,
} from "@/constants/governance/trusteeProfileMasterData";
import type { TrusteeMasterKey } from "@/config/governance/trusteeProfileSections";

export function resolveTrusteeMasterOptions(key: TrusteeMasterKey): string[] {
  switch (key) {
    case "genders":
      return GENDERS;
    case "nationalities":
      return NATIONALITIES;
    case "countries":
      return COUNTRIES;
    case "indianStates":
      return INDIAN_STATES_UT;
    case "organisations":
      return ORGANISATIONS_TRUST;
    case "governingBodyTypes":
      return GOVERNING_BODY_TYPES;
    case "designations":
      return DESIGNATIONS;
    case "appointmentStatuses":
      return APPOINTMENT_STATUSES;
    case "governmentIdTypes":
      return GOVERNMENT_ID_TYPES;
    case "occupations":
      return OCCUPATIONS;
    case "areasOfExpertise":
      return AREAS_OF_EXPERTISE;
    case "professionalRegistrationTypes":
      return PROFESSIONAL_REGISTRATION_TYPES;
    case "languages":
      return LANGUAGES;
    case "documentTypes":
      return DOCUMENT_TYPES;
    case "verificationStatuses":
      return VERIFICATION_STATUSES;
    case "phoneCountryCodes":
      return PHONE_COUNTRY_CODES;
    default:
      return [];
  }
}

export { districtsForState };

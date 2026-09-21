import type { Sidebar, StepId, StepMeta } from "@/types/registration";

export const PUBLIC_REGISTRATION_STEPS: StepId[] = [
  "category",
  "group",
  "profession",
  "details",
  "documents",
  "review",
];

export const STEP_CATALOG: Record<StepId, StepMeta> = {
  category: { title: "Select Category", subtitle: "Professional category" },
  group: { title: "Select Group", subtitle: "Professional group" },
  profession: { title: "Select Profession", subtitle: "Your profession" },
  association: { title: "Association", subtitle: "" },
  specialisation: { title: "Specialisation", subtitle: "" },
  details: { title: "Fill Details", subtitle: "Your information" },
  documents: { title: "Upload Documents", subtitle: "Verification documents" },
  review: { title: "Review & Submit", subtitle: "Confirm and submit" },
};

export function getStepMeta(stepId: StepId): StepMeta {
  return STEP_CATALOG[stepId];
}

export function getSteps(): StepId[] {
  return PUBLIC_REGISTRATION_STEPS;
}

export const DEFAULT_ONBOARDING_SIDEBAR: Sidebar = {
  guidelines: [
    "Provide accurate and complete information.",
    "Use official documents for verification uploads.",
    "Ensure contact details are active for ICJ communication.",
  ],
  whyRegister: [
    "Join the ICJ professional network.",
    "Access member services and verification.",
    "Contribute to statutory legal aid initiatives.",
  ],
  security:
    "Your data is handled securely and used only for professional onboarding and verification.",
};

export function buildYearOptions(from = 1960): string[] {
  const now = new Date().getFullYear();
  const out: string[] = [];
  for (let y = now; y >= from; y -= 1) out.push(String(y));
  return out;
}

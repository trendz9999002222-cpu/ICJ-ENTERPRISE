import type { UserProfessionInfo } from "@/types/api";

export const PROFESSIONAL_ONBOARDING_STEPS = [
  "Application Submitted",
  "Documents Verified",
  "Admin Review",
  "Approved & Active",
] as const;

export function isProfessionalApproved(professions: UserProfessionInfo[] | undefined | null): boolean {
  if (!professions?.length) return false;
  return professions.some((p) => p.status === "approved");
}

/** Primary registration shown on the professional dashboard (most recent). */
export function getPrimaryProfession(
  professions: UserProfessionInfo[] | undefined | null,
): UserProfessionInfo | null {
  if (!professions?.length) return null;
  return [...professions].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta;
  })[0];
}

export function statusToActiveStep(status: string | undefined): number {
  switch (status) {
    case "approved":
      return 3;
    case "under_review":
      return 2;
    case "rejected":
      return 2;
    case "pending":
    default:
      return 0;
  }
}

export function formatProfessionalStatusLabel(status: string | undefined): string {
  if (!status) return "Pending";
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

import type { PublicProfessional } from "@/types/public";

/** Replace each letter/digit with `x` (same length as the original run). */
export function maskAlphanumericRun(run: string): string {
  if (!run) return run;
  return "x".repeat(run.length);
}

function maskNameToken(token: string): string {
  return token.replace(/[A-Za-z0-9]/g, "x");
}

/** Mask person name: every letter/digit becomes `x`; spaces and punctuation stay. */
export function maskPublicFullName(fullName: string): string {
  if (!fullName?.trim()) return fullName;
  return fullName
    .trim()
    .split(/\s+/)
    .map((token) => maskNameToken(token))
    .join(" ");
}

/** Mask registration / licence / certificate numbers (separators unchanged). */
export function maskPublicRegNumber(reg: string): string {
  if (!reg?.trim()) return reg;
  return reg.replace(/[A-Za-z0-9]/g, "x");
}

export function maskPublicProfessional(professional: PublicProfessional): PublicProfessional {
  return {
    ...professional,
    fullName: maskPublicFullName(professional.fullName),
    barOrRegNumber: professional.barOrRegNumber
      ? maskPublicRegNumber(professional.barOrRegNumber)
      : professional.barOrRegNumber,
  };
}

/** Avatar initials when display names are fully masked. */
export function publicProfessionalInitials(_displayName: string): string {
  return "XX";
}

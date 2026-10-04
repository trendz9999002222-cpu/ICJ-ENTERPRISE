import type { PublicProfessional } from "@/types/public";

/** Replace each letter/digit with `x` (same length as the original run). */
export function maskAlphanumericRun(run: string): string {
  if (!run) return run;
  return "x".repeat(run.length);
}

function maskNameToken(token: string): string {
  return token.replace(/[A-Za-z0-9]/g, "x");
}

export function maskPublicFullName(fullName: string): string {
  return fullName;
}

export function maskPublicRegNumber(reg: string): string {
  return reg;
}

export function maskPublicProfessional(professional: PublicProfessional): PublicProfessional {
  return professional;
}

export function publicProfessionalInitials(displayName: string): string {
  if (!displayName) return "P";
  const parts = displayName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** ICJ platform roles exposed in UI and JWT (after normalization). */
export type PlatformRole = "admin" | "professional" | "member";

const LEGACY_PROFESSIONAL = new Set(["advocate", "client", "professional", "legal_professional"]);
const LEGACY_ADMIN = new Set(["super_admin", "admin"]);

export function normalizePlatformRole(role: string | null | undefined): PlatformRole | null {
  if (!role) return null;
  const key = role.toLowerCase().trim();
  if (LEGACY_ADMIN.has(key)) return "admin";
  if (LEGACY_PROFESSIONAL.has(key)) return "professional";
  if (key === "member") return "member";
  return null;
}

export function normalizePlatformRoles(roles: string[] | null | undefined): PlatformRole[] {
  if (!roles?.length) return [];
  const out = new Set<PlatformRole>();
  for (const r of roles) {
    const norm = normalizePlatformRole(r);
    if (norm) out.add(norm);
  }
  return Array.from(out).sort();
}

export function formatPlatformRoleLabel(role: string): string {
  const norm = normalizePlatformRole(role);
  if (norm === "admin") return "Admin";
  if (norm === "professional") return "Professional";
  if (norm === "member") return "Member";
  return role.replace(/_/g, " ");
}

export function userHasProfessionalAccess(roles: string[], primaryRole?: string): boolean {
  const all = normalizePlatformRoles([...roles, ...(primaryRole ? [primaryRole] : [])]);
  return all.includes("professional");
}

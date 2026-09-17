import { maskPublicFullName, maskPublicRegNumber } from "@/lib/privacy/maskPublicIdentity";

/** Toggle public static PII masking (default on). Set NEXT_PUBLIC_MASK_STATIC_PII=false to show raw mock data. */
export function isStaticPiiMaskEnabled(): boolean {
  return process.env.NEXT_PUBLIC_MASK_STATIC_PII !== "false";
}

const PERSON_NAME_KEYS = new Set([
  "fullName",
  "recipientName",
  "leadCoordinator",
  "instructor",
  "donorInitials",
  "speaker",
]);

const IDENTIFIER_KEYS = new Set([
  "barOrRegNumber",
  "certificateNumber",
  "verificationHash",
  "registrationNumber",
  "licenseNumber",
  "enrollmentNumber",
  "receiptNumber",
  "memberId",
  "referenceId",
]);

const ORG_NAME_HINTS =
  /^(ICJ\b|Legal Research Cell|Editorial Board|ICJ ADR|ICJ Media|ICJ National|ICJ Western|ICJ Southern|ICJ Eastern|Apex Legal)/i;

/** Institution / chapter labels — not personal names. */
export function isOrganizationDisplayName(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  if (ORG_NAME_HINTS.test(t)) return true;
  if (/Chapter$/i.test(t) || /Secretariat$/i.test(t) || /Academic Council$/i.test(t)) return true;
  if (/Working Group$/i.test(t) || /Research Cell$/i.test(t) || /Media Cell$/i.test(t)) return true;
  if (/LLP$/i.test(t) || /Foundations/i.test(t)) return true;
  return false;
}

export function isLikelyPersonDisplayName(value: string): boolean {
  const t = value.trim();
  if (!t || isOrganizationDisplayName(t)) return false;
  if (/^(Adv\.|Sr\.\s*Adv\.|Dr\.|Prof\.|CA |CS |Hon'ble|Justice|Shri|Smt\.|Mr\.|Ms\.)/i.test(t)) return true;
  if (/Prof\.\s*\(Dr\.\)/i.test(t)) return true;
  if (/^[A-Z]\.\s*[A-Z]\./.test(t)) return true;
  if (/Panel$/i.test(t) && /Justice|Hon'ble|Sikri|Retd/i.test(t)) return true;
  return false;
}

function maskPersonName(value: string): string {
  return maskPublicFullName(value);
}

function maskIdentifier(value: string): string {
  if (/^SHA256:/i.test(value)) {
    const prefix = "SHA256:";
    return prefix + maskPublicRegNumber(value.slice(prefix.length));
  }
  return maskPublicRegNumber(value);
}

function maskByKey(key: string, value: string): string {
  if (IDENTIFIER_KEYS.has(key)) return maskIdentifier(value);
  if (PERSON_NAME_KEYS.has(key)) return maskPersonName(value);
  if (key === "name") {
    if (isOrganizationDisplayName(value)) return value;
    if (isLikelyPersonDisplayName(value)) return maskPersonName(value);
    return value;
  }
  if (key === "authors" || key === "sourceOrAuthor") {
    return isLikelyPersonDisplayName(value) ? maskPersonName(value) : value;
  }
  return value;
}

function deepMask(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "string") {
        return isLikelyPersonDisplayName(item) ? maskPersonName(item) : item;
      }
      return deepMask(item);
    });
  }

  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
      if (typeof child === "string") {
        out[key] = maskByKey(key, child);
      } else {
        out[key] = deepMask(child);
      }
    }
    return out;
  }

  return value;
}

/** Apply temporary privacy masking to static mock datasets before export. */
export function maskStaticDataset<T>(data: T): T {
  if (!isStaticPiiMaskEnabled()) return data;
  return deepMask(data) as T;
}

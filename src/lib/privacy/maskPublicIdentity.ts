import type { PublicProfessional } from "@/types/public";

/** Fixed mask between first and last visible character (per privacy policy). */
const MASK_FILL = "xxxxxxx";

const PUBLIC_TITLE_TOKENS = new Set(
  ["adv.", "sr.", "ca", "cs", "dr.", "prof."].map((t) => t.toLowerCase()),
);

/** Keep first and last character of each alphanumeric run; replace the middle with `xxxxxxx`. */
export function maskAlphanumericRun(run: string): string {
  if (!run) return run;
  const len = run.length;
  if (len === 1) return run;
  if (len === 2) return `${run[0]}${MASK_FILL}${run[1]}`;
  return `${run[0]}${MASK_FILL}${run[len - 1]}`;
}

function maskNameToken(token: string): string {
  if (/^[A-Za-z]\.$/.test(token)) {
    return "X.";
  }

  const normalized = token.toLowerCase().replace(/\.$/, "");
  if (PUBLIC_TITLE_TOKENS.has(normalized) || PUBLIC_TITLE_TOKENS.has(token.toLowerCase())) {
    return token;
  }
  if (/^adv\.$/i.test(token) || /^sr\.$/i.test(token)) {
    return token;
  }

  let out = "";
  let buf = "";
  for (const ch of token) {
    if (/[A-Za-z0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) {
        out += maskAlphanumericRun(buf);
        buf = "";
      }
      out += ch;
    }
  }
  if (buf) out += maskAlphanumericRun(buf);
  return out;
}

/** Mask person name for public directory (titles like Adv. stay visible). */
export function maskPublicFullName(fullName: string): string {
  if (!fullName?.trim()) return fullName;
  return fullName
    .trim()
    .split(/\s+/)
    .map((token) => {
      if (/^(Adv\.|Sr\.\s*Adv\.|CA|CS|Dr\.|Prof\.)$/i.test(token)) {
        return token;
      }
      if (/^Sr\.$/i.test(token)) return token;
      return maskNameToken(token);
    })
    .join(" ");
}

/** Mask bar / registration numbers while keeping separators (e.g. D/1xxxxxxx8/2xxxxxxx9). */
export function maskPublicRegNumber(reg: string): string {
  if (!reg?.trim()) return reg;

  let out = "";
  let buf = "";
  for (const ch of reg) {
    if (/[A-Za-z0-9]/.test(ch)) {
      buf += ch;
    } else {
      if (buf) {
        out += maskAlphanumericRun(buf);
        buf = "";
      }
      out += ch;
    }
  }
  if (buf) out += maskAlphanumericRun(buf);
  return out;
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

/** Initials for avatar from a (possibly masked) display name. */
export function publicProfessionalInitials(displayName: string): string {
  return displayName
    .replace(/^Adv\.\s*|^Sr\.\s*Adv\.\s*|^CA\s*|^CS\s*|^Dr\.\s*|^Prof\.\s*/i, "")
    .split(" ")
    .filter((part) => part.length > 0 && part !== ".")
    .map((n) => n.match(/[A-Za-z]/)?.[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

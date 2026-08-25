/**
 * ICJ ENTERPRISE INPUT SANITIZER SERVICE
 * Defense against SQL Injection (SQLi), Cross-Site Scripting (XSS), and Malicious Script Payloads.
 */

export const InputSanitizerService = {
  /**
   * Sanitizes plain text input by stripping HTML tags, script execution tokens, and SQL injection syntax.
   */
  sanitizeText(input) {
    if (typeof input !== "string") return input;
    if (!input) return "";

    return input
      // Strip script and iframe tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      // Strip dangerous HTML event handlers (onload, onerror, onclick, etc.)
      .replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, "")
      .replace(/\bon\w+\s*=\s*[^\s>]+/gi, "")
      // Strip javascript: pseudo-protocol
      .replace(/javascript\s*:/gi, "")
      // Sanitize dangerous SQL tokens in text
      .replace(/(\b(UNION\s+ALL|UNION\s+SELECT|DROP\s+TABLE|ALTER\s+TABLE|TRUNCATE\s+TABLE|SELECT\s+\*\s+FROM|EXEC\s*\(|EXECUTE\s*\()\b)/gi, "[BLOCKED_QUERY_TOKEN]")
      .trim();
  },

  /**
   * Sanitizes all string values within an object recursively
   */
  sanitizeObject(obj) {
    if (!obj || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "string") {
        sanitized[key] = this.sanitizeText(value);
      } else if (typeof value === "object" && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  },

  /**
   * Checks if input contains high-risk exploit payloads
   */
  detectThreatPayload(input) {
    if (typeof input !== "string") return false;
    const maliciousPatterns = [
      /<script[\s\S]*?>[\s\S]*?<\/script>/i,
      /javascript:/i,
      /\bonerror\s*=/i,
      /\bonload\s*=/i,
      /'\s*OR\s*'\d+'\s*=\s*'\d+/i,
      /"\s*OR\s*"\d+"\s*=\s*"\d+/i,
      /UNION\s+SELECT/i,
      /DROP\s+TABLE/i,
      /--\s*$/m,
    ];
    return maliciousPatterns.some((pattern) => pattern.test(input));
  },
};

export default InputSanitizerService;

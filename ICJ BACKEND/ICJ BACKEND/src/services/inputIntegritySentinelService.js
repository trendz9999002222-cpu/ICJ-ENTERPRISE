/**
 * ICJ ENTERPRISE INPUT & LAYOUT INTEGRITY SENTINEL SERVICE
 * Prevents unintended regressions, enforces 10-digit strict Indian phone number formatting,
 * and maintains layout grid integrity across all device breakpoints.
 */

export const InputIntegritySentinelService = {
  /**
   * Strictly formats and locks Indian Phone Numbers to exactly 10 digits
   */
  formatIndianPhone(value) {
    if (!value) return "";
    // Remove all non-digits
    let cleaned = value.replace(/\D/g, "");
    
    // Strip leading 0 or 91 if present
    if (cleaned.startsWith("91") && cleaned.length > 10) {
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith("0") && cleaned.length > 10) {
      cleaned = cleaned.substring(1);
    }

    // Strictly limit to 10 digits
    return cleaned.slice(0, 10);
  },

  /**
   * Validates 10-digit Indian mobile number
   */
  isValidIndianPhone(phone) {
    const formatted = this.formatIndianPhone(phone);
    return /^[6-9]\d{9}$/.test(formatted);
  },

  /**
   * Sanitizes generic input strings to prevent CSS/layout breaks
   */
  sanitizeLayoutText(text, maxLength = 250) {
    if (!text || typeof text !== "string") return "";
    return text.trim().slice(0, maxLength);
  },
};

export default InputIntegritySentinelService;

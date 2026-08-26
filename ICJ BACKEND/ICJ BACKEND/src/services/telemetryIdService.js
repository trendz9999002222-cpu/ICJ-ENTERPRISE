/**
 * TelemetryIdService — ICJ Enterprise Platform
 * 140-Crore Scalable Dual-Telemetry Member ID Generation & Headcount Engine
 *
 * Master Structure: 26-[OPTION_A_CATEGORY_SEQ]-[5_LETTER_CAT_CODE]-[OPTION_D_GLOBAL_SEQ]
 * Example: 26-AAA001-ADVUP-AAAA0001
 *
 * - Option A (Category Sequence): AAA001 to ZZZ999 (Capacity: 17,558,424 per profession)
 * - 5-Letter Category Code: Symmetrical 5 characters (e.g. ADVUP, CHACT, NPADV, RtJUD, MNSHI, CLINT)
 * - Option D (Global Sequence): AAAA0001 to ZZZZ9999 (Capacity: 4,569,760,000 across 140 Cr India)
 */

const STORAGE_KEYS = {
  GLOBAL_COUNTER: "icj_telemetry_global_counter",
  CATEGORY_COUNTERS: "icj_telemetry_category_counters",
};

export const TelemetryIdService = {
  /**
   * Convert a 1-based integer index to 3-letter + 3-digit Option A format (AAA001 to ZZZ999)
   */
  indexToOptionA(index = 1) {
    const idx = Math.max(1, index) - 1; // 0-based
    const digitsPerLetterCycle = 999;
    const letterIndex = Math.floor(idx / digitsPerLetterCycle);
    const numPart = (idx % digitsPerLetterCycle) + 1;

    // 3 Letters (AAA to ZZZ, 26^3 = 17,576 combinations)
    const c1 = String.fromCharCode(65 + Math.floor(letterIndex / (26 * 26)) % 26);
    const c2 = String.fromCharCode(65 + Math.floor(letterIndex / 26) % 26);
    const c3 = String.fromCharCode(65 + (letterIndex % 26));

    const numStr = String(numPart).padStart(3, "0");
    return `${c1}${c2}${c3}${numStr}`;
  },

  /**
   * Convert a 1-based integer index to 4-letter + 4-digit Option D format (AAAA0001 to ZZZZ9999)
   */
  indexToOptionD(index = 1) {
    const idx = Math.max(1, index) - 1; // 0-based
    const digitsPerLetterCycle = 9999;
    const letterIndex = Math.floor(idx / digitsPerLetterCycle);
    const numPart = (idx % digitsPerLetterCycle) + 1;

    // 4 Letters (AAAA to ZZZZ, 26^4 = 456,976 combinations)
    const c1 = String.fromCharCode(65 + Math.floor(letterIndex / (26 * 26 * 26)) % 26);
    const c2 = String.fromCharCode(65 + Math.floor(letterIndex / (26 * 26)) % 26);
    const c3 = String.fromCharCode(65 + Math.floor(letterIndex / 26) % 26);
    const c4 = String.fromCharCode(65 + (letterIndex % 26));

    const numStr = String(numPart).padStart(4, "0");
    return `${c1}${c2}${c3}${c4}${numStr}`;
  },

  /**
   * Get Next Global Sequence Count
   */
  getNextGlobalCount() {
    try {
      const current = parseInt(localStorage.getItem(STORAGE_KEYS.GLOBAL_COUNTER) || "0", 10);
      const next = current + 1;
      localStorage.setItem(STORAGE_KEYS.GLOBAL_COUNTER, String(next));
      return next;
    } catch {
      return 1;
    }
  },

  /**
   * Get Current Global Sequence Count
   */
  getCurrentGlobalCount() {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.GLOBAL_COUNTER) || "7", 10);
    } catch {
      return 7;
    }
  },

  /**
   * Get Next Category-Specific Count
   */
  getNextCategoryCount(categoryCode = "CLINT") {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORY_COUNTERS);
      const counters = raw ? JSON.parse(raw) : {};
      const current = counters[categoryCode] || 0;
      const next = current + 1;
      counters[categoryCode] = next;
      localStorage.setItem(STORAGE_KEYS.CATEGORY_COUNTERS, JSON.stringify(counters));
      return next;
    } catch {
      return 1;
    }
  },

  /**
   * Get Live Telemetry Headcount Map
   */
  getLiveHeadcounts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CATEGORY_COUNTERS);
      const categoryCounts = raw ? JSON.parse(raw) : {};
      const globalTotal = parseInt(localStorage.getItem(STORAGE_KEYS.GLOBAL_COUNTER) || "7", 10);

      return {
        globalTotal,
        categoryCounts,
      };
    } catch {
      return { globalTotal: 7, categoryCounts: {} };
    }
  },

  /**
   * Generate Complete 26-Series Dual-Telemetry ID
   * @param {string} categoryCode5 - 5-character category code (e.g. ADVUP, CHACT, NPADV, RtJUD)
   * @param {number} forcedCatIndex - Optional forced category index
   * @param {number} forcedGlobalIndex - Optional forced global index
   */
  generateMemberId(categoryCode5 = "CLINT", forcedCatIndex = null, forcedGlobalIndex = null) {
    let cleanCat = String(categoryCode5).padEnd(5, "X").substring(0, 5);
    if (!cleanCat.startsWith("Rt")) {
      cleanCat = cleanCat.toUpperCase();
    }
    const catIndex = forcedCatIndex || this.getNextCategoryCount(cleanCat);
    const globalIndex = forcedGlobalIndex || this.getNextGlobalCount();

    const optA = this.indexToOptionA(catIndex);
    const optD = this.indexToOptionD(globalIndex);

    return `26-${optA}-${cleanCat}-${optD}`;
  },

  /**
   * Parse a 26-Series ID back into its telemetry components
   */
  parseMemberId(idString = "") {
    const parts = idString.split("-");
    if (parts.length === 4 && parts[0] === "26") {
      return {
        isValid: true,
        yearPrefix: parts[0],
        categorySeqStr: parts[1],
        categoryCode5: parts[2],
        globalSeqStr: parts[3],
      };
    }
    return { isValid: false, raw: idString };
  },
};

export default TelemetryIdService;

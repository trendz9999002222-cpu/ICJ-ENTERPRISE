/**
 * Client Feature Configuration & Access Rights Provisioning
 * 
 * Allows admin/executive to easily toggle and enable/disable advanced features
 * for Litigant Clients on demand.
 */

const STORAGE_KEY = "icj_client_feature_flags";

export const DEFAULT_CLIENT_FEATURE_FLAGS = {
  // 1. AI Deep Legal Diagnosis & LLM API Key Settings (Currently Disabled for Client)
  aiDiagnosis: false,

  // 2. 2,000+ Bare Acts, Supreme Court Citation Explorer & Legal Library (Disabled for Client)
  statuteLibrary: false,

  // 3. Repealed Acts Concordance & Semantic Hypergraph Navigator (Disabled for Client)
  legalHypergraph: false,

  // 4. Multi-Modal Bulk Case Ingestion Engine (Disabled for Client)
  bulkCaseIngestion: false,

  // 5. Advocate-Client Live Radar Rendezvous (Disabled for Client)
  locationRadar: false,

  // 6. E-Gov Partner & Multi-Forum Administration Desk (Disabled for Client)
  egovPartnerDesk: false,

  // 7. Token Pre-paid Simulation & Currency Exchange (Disabled for Client)
  tokenExchangeModal: false,

  // 8. Core Essential Client Operations (Always Active)
  caseFiling: true,
  advocateInteraction: true,
  documentVault: true,
  directMessaging: true,
  liveHearingTracking: true,
};

export const ClientFeatureService = {
  /**
   * Get current client feature flags
   */
  getFlags() {
    try {
      if (typeof localStorage !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return { ...DEFAULT_CLIENT_FEATURE_FLAGS, ...JSON.parse(stored) };
        }
      }
    } catch (e) {
      console.warn("ClientFeatureService read error:", e);
    }
    return { ...DEFAULT_CLIENT_FEATURE_FLAGS };
  },

  /**
   * Update or toggle a specific feature flag
   */
  setFlag(flagName, value) {
    try {
      const current = this.getFlags();
      current[flagName] = Boolean(value);
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      }
      return current;
    } catch (e) {
      console.warn("ClientFeatureService write error:", e);
      return DEFAULT_CLIENT_FEATURE_FLAGS;
    }
  },

  /**
   * Reset to default simplified configuration
   */
  resetToDefaults() {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CLIENT_FEATURE_FLAGS));
      }
    } catch (e) {}
    return { ...DEFAULT_CLIENT_FEATURE_FLAGS };
  },
};

export default ClientFeatureService;

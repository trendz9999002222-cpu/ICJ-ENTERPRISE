const AIAPIPlaceholder = {
  async health() {
    return {
      status: "FOUNDATION_ONLY",
      message: "AI API placeholder is active. External provider execution is disabled for launch.",
      externalCallsEnabled: false,
    };
  },

  async listProviders() {
    return [
      {
        id: "internal-foundation",
        label: "Internal Foundation Provider",
        enabled: true,
        external: false,
      },
    ];
  },

  async executePlaceholder(providerName, request = {}) {
    return {
      provider: providerName || "internal-foundation",
      status: "PLACEHOLDER_EXECUTED",
      output:
        "AI foundation request accepted through placeholder API. " +
        `Module: ${request.moduleId || "global"}.`,
      meta: {
        externalCall: false,
      },
    };
  },
};

export default AIAPIPlaceholder;

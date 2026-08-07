const ensureRequest = (request = {}) => {
  const promptText = String(request.promptText || "").trim();
  if (!promptText) {
    throw new Error("Prompt text is required.");
  }
  return {
    ...request,
    promptText,
  };
};

const createInternalFoundationProvider = () => ({
  name: "internal-foundation",
  async execute(request) {
    const safe = ensureRequest(request);
    return {
      provider: "internal-foundation",
      status: "FOUNDATION_READY",
      output:
        "AI foundation is active. Inference providers are intentionally disabled for launch. " +
        `Prompt accepted for module ${safe.moduleId || "global"}.`,
      meta: {
        tokensEstimated: Math.ceil(safe.promptText.length / 4),
        externalCall: false,
      },
    };
  },
});

const createProvider = (name) => {
  if (name === "internal-foundation") return createInternalFoundationProvider();

  return {
    name,
    async execute(request) {
      ensureRequest(request);
      return {
        provider: name,
        status: "PROVIDER_NOT_CONFIGURED",
        output: `Provider ${name} is registered but disabled in launch configuration.`,
        meta: { externalCall: false },
      };
    },
  };
};

export { createProvider };

import { createProvider } from "./aiProviderInterface";
import AIAPIPlaceholder from "./aiApiPlaceholder";

const AIAPIAdapter = {
  async execute(providerName, request) {
    await AIAPIPlaceholder.health();
    const provider = createProvider(providerName || "internal-foundation");
    const startedAt = Date.now();
    const response = await provider.execute(request);
    const durationMs = Date.now() - startedAt;

    return {
      ...response,
      durationMs,
    };
  },

  async getProviderCatalog() {
    return AIAPIPlaceholder.listProviders();
  },
};

export default AIAPIAdapter;

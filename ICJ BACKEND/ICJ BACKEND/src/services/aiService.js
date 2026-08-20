import AICoreEngine from "./aiCoreEngine";

/**
 * Consolidated AIService
 * Forwarding to single source of truth: aiCoreEngine.js
 */
const AIService = {
  async ask(prompt, context = []) {
    const res = await AICoreEngine.generateLegalAnalysis({ problemDescription: prompt });
    return res.rawResponse || res.legalAdvice || "AI consultation completed.";
  },
};

export default AIService;

import { supabase } from "./supabase";

const aiEndpoint = import.meta.env.VITE_AI_API_URL;

const AIService = {
  async ask(prompt, context = []) {
    const normalizedPrompt = String(prompt || "").trim();

    if (!normalizedPrompt) {
      throw new Error("Prompt is required.");
    }

    if (aiEndpoint) {
      const response = await fetch(aiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: normalizedPrompt, context }),
      });

      if (!response.ok) {
        throw new Error("AI service request failed.");
      }

      const payload = await response.json();
      return payload.answer || payload.response || "No response generated.";
    }

    if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
      try {
        const { data, error } = await supabase.functions.invoke("ai-assistant", {
          body: { prompt: normalizedPrompt, context },
        });

        if (error) throw error;
        return data?.answer || data?.response || "No response generated.";
      } catch {
        return "AI endpoint is not configured yet. Set VITE_AI_API_URL or deploy ai-assistant edge function.";
      }
    }

    return "AI endpoint is not configured yet. Set VITE_AI_API_URL or deploy ai-assistant edge function.";
  },
};

export default AIService;

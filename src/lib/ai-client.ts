import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// Ordered fallback list. Primary first.
// OPENROUTER_MODEL env var overrides primary (useful for testing specific models).
// openrouter/free is OpenRouter's dynamic free-tier router — it selects the best
// available free model at request time. Repeating it as a fallback is intentional:
// a second call may route to a different underlying model if the first choice fails.
export const MODEL_FALLBACK_LIST: string[] = [
  process.env.OPENROUTER_MODEL ?? "openrouter/free",
  "openrouter/free", // retry dynamic router — may select a different underlying model
];

function createOpenRouterProvider() {
  return createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    headers: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Satori Canton - Career Site",
    },
  });
}

/** Returns a LanguageModel for a given model ID string. */
export function getOpenRouterModel(modelId: string): LanguageModel {
  const openrouter = createOpenRouterProvider();
  return openrouter(modelId);
}

/** Backwards-compatible: returns the primary model (MODEL_FALLBACK_LIST[0]). */
export function getAIModel(): LanguageModel {
  return getOpenRouterModel(MODEL_FALLBACK_LIST[0]);
}

import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// Ordered fallback list. Primary first.
// OPENROUTER_MODEL env var overrides primary (useful for testing specific models).
// Models chosen for reliable free-tier availability on OpenRouter.
// Avoided: meta-llama/llama-3.1-8b-instruct:free (frequent "no endpoints"),
//          google/gemma-3-12b-it:free (quickly rate-limited by Google AI Studio).
export const MODEL_FALLBACK_LIST: string[] = [
  process.env.OPENROUTER_MODEL ?? "openrouter/auto",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
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

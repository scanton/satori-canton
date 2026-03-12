import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

// Lazy factory — called at request time, not module load time,
// so missing env vars during build don't throw.
export function getAIModel(): LanguageModel {
  const provider = process.env.AI_PROVIDER ?? "openrouter";

  if (provider === "anthropic") {
    // To use Anthropic: pnpm add @ai-sdk/anthropic, then swap in below
    // import { createAnthropic } from "@ai-sdk/anthropic";
    // const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    // return anthropic(process.env.ANTHROPIC_MODEL ?? "claude-opus-4-6");
    throw new Error(
      "Anthropic provider not configured. Set AI_PROVIDER=openrouter or install @ai-sdk/anthropic."
    );
  }

  // Default: OpenRouter (OpenAI-compatible)
  const openrouter = createOpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY ?? "",
    headers: {
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      "X-Title": "Satori Canton - Career Site",
    },
  });

  return openrouter(process.env.OPENROUTER_MODEL ?? "openrouter/free");
}

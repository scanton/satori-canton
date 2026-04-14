import { createHash } from "crypto";
import type { JobFitResult } from "@/lib/types";

export interface CachedAnalysis {
  id: string;
  result: JobFitResult;
  roleHint: string;
  createdAt: string;
}

const KV_TTL_SECONDS = 604800; // 7 days

function sha256(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

function isKvConfigured(): boolean {
  return !!(
    process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
  );
}

async function getKv() {
  if (!isKvConfigured()) return null;
  try {
    const { kv } = await import("@vercel/kv");
    return kv;
  } catch {
    return null;
  }
}

/** Returns cached analysis for a given JD (cache miss returns null). */
export async function getCachedAnalysisByJD(
  jobDescription: string
): Promise<CachedAnalysis | null> {
  try {
    const kv = await getKv();
    if (!kv) return null;
    const hash = sha256(jobDescription);
    const id = await kv.get<string>(`analysis-jd:${hash}`);
    if (!id) return null;
    return kv.get<CachedAnalysis>(`analysis:${id}`);
  } catch (err) {
    console.warn("[analysis-cache] KV read by JD failed (non-fatal):", err);
    return null;
  }
}

/** Returns cached analysis by share ID (expired/missing returns null). */
export async function getCachedAnalysisById(
  id: string
): Promise<CachedAnalysis | null> {
  try {
    const kv = await getKv();
    if (!kv) return null;
    return kv.get<CachedAnalysis>(`analysis:${id}`);
  } catch (err) {
    console.warn("[analysis-cache] KV read by ID failed (non-fatal):", err);
    return null;
  }
}

/**
 * Writes an analysis to the KV cache.
 * Returns the share ID if write succeeded, null if KV is unavailable or write failed.
 * Caller must NOT show a share link if this returns null.
 */
export async function writeCachedAnalysis(
  jobDescription: string,
  result: JobFitResult
): Promise<string | null> {
  try {
    const kv = await getKv();
    if (!kv) return null;

    const { nanoid } = await import("nanoid");
    const id = nanoid(10);
    const hash = sha256(jobDescription);
    const roleHint = jobDescription.split("\n")[0].trim().slice(0, 80);
    const createdAt = new Date().toISOString();
    const entry: CachedAnalysis = { id, result, roleHint, createdAt };

    await Promise.all([
      kv.set(`analysis:${id}`, entry, { ex: KV_TTL_SECONDS }),
      kv.set(`analysis-jd:${hash}`, id, { ex: KV_TTL_SECONDS }),
    ]);

    console.log(`[analysis-cache] Wrote analysis:${id}`);
    return id;
  } catch (err) {
    console.warn("[analysis-cache] KV write failed (non-fatal):", err);
    return null;
  }
}

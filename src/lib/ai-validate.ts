import type { JobFitResult } from "@/lib/types";

export function isValidJobFitResult(r: unknown): r is JobFitResult {
  if (typeof r !== "object" || r === null) return false;
  const obj = r as Record<string, unknown>;
  return (
    Array.isArray(obj.strengths) &&
    obj.strengths.length > 0 &&
    Array.isArray(obj.weaknesses) &&
    typeof obj.score === "number" &&
    obj.score >= 0 &&
    obj.score <= 100 &&
    ["A", "B", "C", "D", "F"].includes(obj.grade as string) &&
    typeof obj.headline === "string" &&
    obj.headline.length > 10 &&
    typeof obj.recommendation === "string" &&
    obj.recommendation.length > 20
  );
}

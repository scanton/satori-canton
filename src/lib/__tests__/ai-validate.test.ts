// @vitest-environment node
import { describe, it, expect } from "vitest";
import { isValidJobFitResult } from "@/lib/ai-validate";

const validResult = {
  score: 78,
  grade: "B",
  headline: "Strong technical fit with a leadership gap",
  roleAlignment: "Good alignment on AI/ML stack.",
  recommendation: "This is a solid recommendation that exceeds twenty chars.",
  strengths: [{ claim: "Deep AI expertise", evidence: "...", heroStoryIds: [] }],
  weaknesses: [],
  relevantStoryIds: [],
};

describe("isValidJobFitResult", () => {
  it("returns true for a valid result", () => {
    expect(isValidJobFitResult(validResult)).toBe(true);
  });

  it("returns false for null", () => {
    expect(isValidJobFitResult(null)).toBe(false);
  });

  it("returns false for a non-object", () => {
    expect(isValidJobFitResult("string")).toBe(false);
  });

  it("returns false when strengths is empty", () => {
    expect(isValidJobFitResult({ ...validResult, strengths: [] })).toBe(false);
  });

  it("returns false when strengths is missing", () => {
    const { strengths: _, ...rest } = validResult;
    expect(isValidJobFitResult(rest)).toBe(false);
  });

  it("returns false when score is out of range", () => {
    expect(isValidJobFitResult({ ...validResult, score: 101 })).toBe(false);
    expect(isValidJobFitResult({ ...validResult, score: -1 })).toBe(false);
  });

  it("returns false for invalid grade", () => {
    expect(isValidJobFitResult({ ...validResult, grade: "G" })).toBe(false);
    expect(isValidJobFitResult({ ...validResult, grade: "a" })).toBe(false);
    expect(isValidJobFitResult({ ...validResult, grade: undefined })).toBe(false);
  });

  it("accepts all valid grade values", () => {
    for (const grade of ["A", "B", "C", "D", "F"]) {
      expect(isValidJobFitResult({ ...validResult, grade })).toBe(true);
    }
  });

  it("returns false when headline is too short", () => {
    expect(isValidJobFitResult({ ...validResult, headline: "Short" })).toBe(false);
  });

  it("returns false when recommendation is too short", () => {
    expect(isValidJobFitResult({ ...validResult, recommendation: "Too short" })).toBe(false);
  });

  it("returns false when weaknesses is not an array", () => {
    expect(isValidJobFitResult({ ...validResult, weaknesses: null })).toBe(false);
  });
});

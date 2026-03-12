import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Strip markdown code fences from AI JSON responses */
export function extractJSON(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return match ? match[1].trim() : text.trim();
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Format a YYYY-MM date string to "Month YYYY" */
export function formatDate(dateStr: string): string {
  if (dateStr === "present") return "Present";
  const [year, month] = dateStr.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

/** Derive a letter grade from a numeric score */
export function scoreToGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

/** Grade label for display */
export function gradeLabel(grade: "A" | "B" | "C" | "D" | "F"): string {
  const labels: Record<string, string> = {
    A: "Exceptional Fit",
    B: "Strong Fit",
    C: "Moderate Fit",
    D: "Weak Fit",
    F: "Poor Fit",
  };
  return labels[grade] ?? "Unknown";
}

// ─── Content Types ────────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  title: string;
  tagline: string;
  bio: string;
  contact: {
    email: string;
    linkedin: string;
    github?: string;
    location: string;
  };
  summary: string;
  availableForWork: boolean;
  preferredRoles: string[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  startDate: string; // "YYYY-MM"
  endDate: string | "present";
  location: string;
  employmentType: "full-time" | "contract" | "consulting" | "fractional";
  summary: string;
  highlights: string[];
  skills: string[];
  heroStoryIds?: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startYear: number;
  endYear: number;
  notes?: string;
}

export interface SkillCategory {
  category: string;
  level: "expert" | "proficient" | "familiar";
  skills: string[];
}

export interface HeroStoryMeta {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  tags: string[];
  companyContext: string;
  outcome: string;
  featured: boolean;
  order: number;
}

export interface HeroStory extends HeroStoryMeta {
  content: string;
  readingTimeMinutes: number;
}

// ─── Job Fit Types ────────────────────────────────────────────────────────────

export interface JobFitStrength {
  claim: string;
  evidence: string;
  heroStoryIds: string[];
}

export interface JobFitWeakness {
  gap: string;
  context: string;
  mitigation?: string;
}

export interface JobFitResult {
  score: number; // 0–100
  grade: "A" | "B" | "C" | "D" | "F";
  headline: string;
  strengths: JobFitStrength[];
  weaknesses: JobFitWeakness[];
  relevantStoryIds: string[];
  roleAlignment: string;
  recommendation: string;
}

// ─── Lead Capture ─────────────────────────────────────────────────────────────

export interface LeadInfo {
  name: string;
  email: string;
  company?: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type JobFitPhase = "input" | "analyzing" | "results" | "interview";

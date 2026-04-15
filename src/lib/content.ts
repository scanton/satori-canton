import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type {
  Profile,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  HeroStoryMeta,
  HeroStory,
  OpenSourceProject,
} from "@/lib/types";

const contentRoot = path.join(process.cwd(), "content");

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function loadProfile(): Promise<Profile> {
  const raw = await fs.readFile(
    path.join(contentRoot, "profile.json"),
    "utf-8"
  );
  return JSON.parse(raw) as Profile;
}

// ─── Resume ───────────────────────────────────────────────────────────────────

export async function loadExperience(): Promise<ExperienceItem[]> {
  const raw = await fs.readFile(
    path.join(contentRoot, "resume", "experience.json"),
    "utf-8"
  );
  return JSON.parse(raw) as ExperienceItem[];
}

export async function loadEducation(): Promise<EducationItem[]> {
  const raw = await fs.readFile(
    path.join(contentRoot, "resume", "education.json"),
    "utf-8"
  );
  return JSON.parse(raw) as EducationItem[];
}

export async function loadSkills(): Promise<SkillCategory[]> {
  const raw = await fs.readFile(
    path.join(contentRoot, "resume", "skills.json"),
    "utf-8"
  );
  return JSON.parse(raw) as SkillCategory[];
}

// ─── Hero Stories ─────────────────────────────────────────────────────────────

export async function loadStoryIndex(): Promise<HeroStoryMeta[]> {
  const raw = await fs.readFile(
    path.join(contentRoot, "hero-stories", "_index.json"),
    "utf-8"
  );
  const data = JSON.parse(raw) as { stories: HeroStoryMeta[] };
  return data.stories.sort((a, b) => a.order - b.order);
}

export async function loadHeroStory(id: string): Promise<HeroStory | null> {
  try {
    const filePath = path.join(contentRoot, "hero-stories", `${id}.mdx`);
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const rt = readingTime(content);
    return {
      ...(data as HeroStoryMeta),
      id,
      content,
      readingTimeMinutes: Math.ceil(rt.minutes),
    };
  } catch {
    return null;
  }
}

export async function loadAllHeroStories(): Promise<HeroStory[]> {
  const index = await loadStoryIndex();
  const stories = await Promise.all(index.map((meta) => loadHeroStory(meta.id)));
  return stories.filter((s): s is HeroStory => s !== null);
}

// ─── Open Source ──────────────────────────────────────────────────────────────

export async function loadOpenSourceProjects(): Promise<OpenSourceProject[]> {
  const raw = await fs.readFile(
    path.join(contentRoot, "open-source.json"),
    "utf-8"
  );
  const projects = JSON.parse(raw) as OpenSourceProject[];
  return projects.sort((a, b) => a.order - b.order);
}

// ─── AI Context Builder ───────────────────────────────────────────────────────

export async function buildProfileContext(): Promise<string> {
  const [profile, experience, education, skills, stories, openSource] = await Promise.all([
    loadProfile(),
    loadExperience(),
    loadEducation(),
    loadSkills(),
    loadStoryIndex(),
    loadOpenSourceProjects(),
  ]);

  return `
## SATORI'S VERIFIED BACKGROUND

### Professional Summary
${profile.summary}

### Education
${education
  .map(
    (edu) =>
      `${edu.degree} in ${edu.field} — ${edu.institution} (${edu.endYear})`
  )
  .join("\n")}

### Work Experience
${experience
  .map(
    (exp) => `
**${exp.role}** at ${exp.company} (${exp.startDate} – ${exp.endDate}) [${exp.employmentType}]
Location: ${exp.location}
Summary: ${exp.summary}
Highlights:
${exp.highlights.map((h) => `  - ${h}`).join("\n")}
Skills demonstrated: ${exp.skills.join(", ")}${exp.heroStoryIds?.length ? `\nSupporting stories: ${exp.heroStoryIds.join(", ")}` : ""}
`
  )
  .join("\n")}

### Skills
${skills.map((cat) => `${cat.category} (${cat.level}): ${cat.skills.join(", ")}`).join("\n")}

### Open Source Projects
${openSource
  .map(
    (p) => `
**${p.name}**${p.npmPackage ? ` (${p.npmPackage} on npm)` : ""}
GitHub: ${p.githubUrl}
${p.description}
Key highlights:
${p.highlights.map((h) => `  - ${h}`).join("\n")}
Technologies: ${p.technologies.join(", ")}
`
  )
  .join("\n")}

### Case Stories (Verified)
${stories
  .map(
    (s) => `
- ID: ${s.id}
  Title: "${s.title}"
  Context: ${s.companyContext}
  Outcome: ${s.outcome}
  Tags: ${s.tags.join(", ")}
`
  )
  .join("")}
`.trim();
}

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
  try {
    const raw = await fs.readFile(
      path.join(contentRoot, "open-source.json"),
      "utf-8"
    );
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error("[content] open-source.json is not an array — check file format");
      return [];
    }
    // Validate and sanitize each project before use.
    const projects = (parsed as OpenSourceProject[])
      .filter((p) => {
        // githubUrl must use https to prevent javascript:/data: URI XSS in rendered <a href>
        if (!p.githubUrl?.startsWith("https://")) {
          console.error(`[content] open-source.json: project "${p.id}" has missing or non-https githubUrl — skipped`);
          return false;
        }
        return true;
      })
      .map((p) => {
        // heroStoryId is used to build a path: /story/<id> — restrict to safe chars
        if (p.heroStoryId && !/^[a-z0-9-]+$/.test(p.heroStoryId)) {
          console.error(`[content] open-source.json: project "${p.id}" has invalid heroStoryId "${p.heroStoryId}" — cleared`);
          return { ...p, heroStoryId: undefined };
        }
        return p;
      });
    // Secondary tie-breaker by id ensures stable order when two projects share the same order value.
    return projects.sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
  } catch (err) {
    // Missing or malformed file → return empty list rather than 500ing the page
    // and cascading into buildProfileContext() (which would also kill /api/chat and /api/job-fit).
    console.error("[content] loadOpenSourceProjects failed:", err);
    return [];
  }
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

  // Build the open source section separately so we can apply a character cap.
  // XML-style tags structurally isolate project field values from the prompt's markdown
  // section headers, preventing content strings from inadvertently disrupting prompt structure.
  const MAX_OPEN_SOURCE_CHARS = 2000;
  const openSourceSection = openSource.length > 0
    ? (() => {
        const raw = `### Open Source Projects\n${openSource
          .map(
            (p) => `<open_source_project id="${p.id}">
**${p.name}**${p.npmPackage ? ` (${p.npmPackage} on npm)` : ""}
GitHub: ${p.githubUrl}
${p.description}
Key highlights:
${(p.highlights ?? []).map((h) => `  - ${h}`).join("\n")}
Technologies: ${(p.technologies ?? []).join(", ")}
</open_source_project>`
          )
          .join("\n")}`;
        return raw.length > MAX_OPEN_SOURCE_CHARS
          ? raw.slice(0, MAX_OPEN_SOURCE_CHARS) + "\n...(content truncated)"
          : raw;
      })()
    : "";

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

${openSourceSection}

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

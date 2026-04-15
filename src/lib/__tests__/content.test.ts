import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fs/promises before importing content.ts so the mock is in place at module load time.
vi.mock("fs/promises", () => ({
  default: {
    readFile: vi.fn(),
  },
}));

import fs from "fs/promises";
import { loadOpenSourceProjects, buildProfileContext } from "@/lib/content";

const mockReadFile = vi.mocked(fs.readFile);

// ─── Minimal fixtures ─────────────────────────────────────────────────────────

const VALID_PROJECT = {
  id: "phase2s",
  name: "Phase2S",
  npmPackage: "@scanton/phase2s",
  tagline: "AI agent harness.",
  description: "Open-source AI coding assistant.",
  githubUrl: "https://github.com/scanton/phase-2-s",
  heroStoryId: "phase2s",
  highlights: ["29 built-in skills"],
  technologies: ["TypeScript"],
  order: 1,
};

const MINIMAL_PROFILE = {
  name: "Satori Canton",
  title: "AI Product Engineer",
  tagline: "tagline",
  bio: "bio",
  contact: { email: "test@example.com", linkedin: "linkedin", location: "SF" },
  summary: "Professional summary here.",
  availableForWork: true,
  preferredRoles: [],
};

// Helper: configure readFile to return appropriate data for all loaders
function mockAllLoaders(openSourceData: unknown = [VALID_PROJECT]) {
  mockReadFile.mockImplementation((filePath: unknown) => {
    const p = filePath as string;
    if (p.includes("profile.json")) return Promise.resolve(JSON.stringify(MINIMAL_PROFILE));
    if (p.includes("experience.json")) return Promise.resolve(JSON.stringify([]));
    if (p.includes("education.json")) return Promise.resolve(JSON.stringify([]));
    if (p.includes("skills.json")) return Promise.resolve(JSON.stringify([]));
    if (p.includes("_index.json")) return Promise.resolve(JSON.stringify({ stories: [] }));
    if (p.includes("open-source.json")) return Promise.resolve(JSON.stringify(openSourceData));
    return Promise.reject(new Error(`Unexpected path: ${p}`));
  });
}

// ─── loadOpenSourceProjects ───────────────────────────────────────────────────

describe("loadOpenSourceProjects", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns sorted projects on happy path", async () => {
    const projectA = { ...VALID_PROJECT, id: "b-project", order: 2 };
    const projectB = { ...VALID_PROJECT, id: "a-project", order: 1 };
    mockReadFile.mockResolvedValue(JSON.stringify([projectA, projectB]) as unknown as string);

    const result = await loadOpenSourceProjects();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("a-project");
    expect(result[1].id).toBe("b-project");
  });

  it("returns [] when file is missing (ENOENT)", async () => {
    mockReadFile.mockRejectedValue(Object.assign(new Error("ENOENT"), { code: "ENOENT" }));
    const result = await loadOpenSourceProjects();
    expect(result).toEqual([]);
  });

  it("returns [] when JSON is malformed", async () => {
    mockReadFile.mockResolvedValue("{ this is not json" as unknown as string);
    const result = await loadOpenSourceProjects();
    expect(result).toEqual([]);
  });

  it("returns [] when JSON root is not an array", async () => {
    mockReadFile.mockResolvedValue(JSON.stringify({ id: "phase2s" }) as unknown as string);
    const result = await loadOpenSourceProjects();
    expect(result).toEqual([]);
  });

  it("skips projects with non-https githubUrl", async () => {
    const unsafe = { ...VALID_PROJECT, id: "bad", githubUrl: "javascript:alert(1)" };
    mockReadFile.mockResolvedValue(JSON.stringify([VALID_PROJECT, unsafe]) as unknown as string);

    const result = await loadOpenSourceProjects();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("phase2s");
  });

  it("clears invalid heroStoryId but keeps the project", async () => {
    const withBadId = { ...VALID_PROJECT, heroStoryId: "../api/job-fit" };
    mockReadFile.mockResolvedValue(JSON.stringify([withBadId]) as unknown as string);

    const result = await loadOpenSourceProjects();
    expect(result).toHaveLength(1);
    expect(result[0].heroStoryId).toBeUndefined();
  });

  it("uses id as tie-breaker when two projects share the same order", async () => {
    const p1 = { ...VALID_PROJECT, id: "z-tool", order: 1 };
    const p2 = { ...VALID_PROJECT, id: "a-tool", order: 1 };
    mockReadFile.mockResolvedValue(JSON.stringify([p1, p2]) as unknown as string);

    const result = await loadOpenSourceProjects();
    expect(result[0].id).toBe("a-tool");
    expect(result[1].id).toBe("z-tool");
  });
});

// ─── buildProfileContext ──────────────────────────────────────────────────────

describe("buildProfileContext", () => {
  beforeEach(() => vi.clearAllMocks());

  it("includes the Open Source Projects section when projects are loaded", async () => {
    mockAllLoaders([VALID_PROJECT]);
    const context = await buildProfileContext();

    expect(context).toContain("### Open Source Projects");
    expect(context).toContain("Phase2S");
    expect(context).toContain("https://github.com/scanton/phase-2-s");
    expect(context).toContain("29 built-in skills");
  });

  it("omits the Open Source Projects section header when list is empty", async () => {
    mockAllLoaders([]);
    const context = await buildProfileContext();

    expect(context).not.toContain("### Open Source Projects");
  });

  it("wraps project data in structural xml tags to isolate it from prompt headers", async () => {
    mockAllLoaders([VALID_PROJECT]);
    const context = await buildProfileContext();

    expect(context).toContain('<open_source_project id="phase2s">');
    expect(context).toContain("</open_source_project>");
  });

  it("still resolves when loadOpenSourceProjects returns empty (error-isolation path)", async () => {
    // Simulate open-source.json missing — readFile rejects for that file only
    mockReadFile.mockImplementation((filePath: unknown) => {
      const p = filePath as string;
      if (p.includes("profile.json")) return Promise.resolve(JSON.stringify(MINIMAL_PROFILE));
      if (p.includes("experience.json")) return Promise.resolve(JSON.stringify([]));
      if (p.includes("education.json")) return Promise.resolve(JSON.stringify([]));
      if (p.includes("skills.json")) return Promise.resolve(JSON.stringify([]));
      if (p.includes("_index.json")) return Promise.resolve(JSON.stringify({ stories: [] }));
      if (p.includes("open-source.json")) return Promise.reject(new Error("ENOENT"));
      return Promise.reject(new Error(`Unexpected path: ${p}`));
    });

    // buildProfileContext must NOT throw — the open source failure is isolated
    const context = await buildProfileContext();
    expect(context).toContain("## SATORI'S VERIFIED BACKGROUND");
    expect(context).not.toContain("### Open Source Projects");
  });

  it("truncates the open source section when it exceeds the character cap", async () => {
    const bigProject = {
      ...VALID_PROJECT,
      description: "A".repeat(3000), // force a very long description
      highlights: ["B".repeat(500)],
    };
    mockAllLoaders([bigProject]);
    const context = await buildProfileContext();

    // The open source section should be present but truncated
    expect(context).toContain("### Open Source Projects");
    expect(context).toContain("content truncated");
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/lib/content", () => ({
  loadOpenSourceProjects: vi.fn(),
}));

// Next.js Link stub
vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: React.PropsWithChildren<object>) => <span>{children}</span>,
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.PropsWithChildren<object>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("@/components/ui/separator", () => ({
  Separator: () => <hr />,
}));

import { loadOpenSourceProjects } from "@/lib/content";
import OpenSourcePage from "@/app/open-source/page";
import type { OpenSourceProject } from "@/lib/types";

const mockProject: OpenSourceProject = {
  id: "phase2s",
  name: "Phase2S",
  npmPackage: "@scanton/phase2s",
  tagline: "AI agent harness for cross-model adversarial review.",
  description: "Open-source AI coding assistant published as @scanton/phase2s on npm.",
  githubUrl: "https://github.com/scanton/phase-2-s",
  heroStoryId: "phase2s",
  highlights: ["29 built-in skills", "Cross-model adversarial review"],
  technologies: ["TypeScript", "Node.js"],
  order: 1,
};

describe("OpenSourcePage", () => {
  it("renders the project name and tagline", async () => {
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([mockProject]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    expect(screen.getByText("Phase2S")).toBeInTheDocument();
    expect(screen.getByText("AI agent harness for cross-model adversarial review.")).toBeInTheDocument();
  });

  it("renders the npm package name when present", async () => {
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([mockProject]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    expect(screen.getByText("@scanton/phase2s")).toBeInTheDocument();
  });

  it("renders the GitHub link", async () => {
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([mockProject]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    const link = screen.getByRole("link", { name: /View on GitHub/i });
    expect(link).toHaveAttribute("href", "https://github.com/scanton/phase-2-s");
  });

  it("renders the case story link when heroStoryId is present", async () => {
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([mockProject]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    const storyLink = screen.getByRole("link", { name: /Read the full case story/i });
    expect(storyLink).toHaveAttribute("href", "/story/phase2s");
  });

  it("omits the case story link when heroStoryId is absent", async () => {
    const noStory = { ...mockProject, heroStoryId: undefined };
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([noStory]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    expect(screen.queryByRole("link", { name: /Read the full case story/i })).not.toBeInTheDocument();
  });

  it("renders all highlights", async () => {
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([mockProject]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    expect(screen.getByText("29 built-in skills")).toBeInTheDocument();
    expect(screen.getByText("Cross-model adversarial review")).toBeInTheDocument();
  });

  it("renders no project cards when the list is empty", async () => {
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    expect(screen.queryByRole("link", { name: /View on GitHub/i })).not.toBeInTheDocument();
    expect(screen.getByText("Open Source")).toBeInTheDocument();
    // Regression guard: no project content should leak into the empty-list view
    expect(screen.queryByText("Phase2S")).not.toBeInTheDocument();
    expect(screen.queryByText(/@scanton/)).not.toBeInTheDocument();
  });

  it("omits the npm badge when npmPackage is absent", async () => {
    const noNpm = { ...mockProject, npmPackage: undefined };
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([noNpm]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    expect(screen.queryByText("@scanton/phase2s")).not.toBeInTheDocument();
    // Project itself still renders
    expect(screen.getByText("Phase2S")).toBeInTheDocument();
  });

  it("renders multiple project cards when list has more than one project", async () => {
    const secondProject: OpenSourceProject = {
      ...mockProject,
      id: "second-tool",
      name: "SecondTool",
      order: 2,
    };
    vi.mocked(loadOpenSourceProjects).mockResolvedValue([mockProject, secondProject]);

    const page = await OpenSourcePage();
    render(page as React.ReactElement);

    expect(screen.getByText("Phase2S")).toBeInTheDocument();
    expect(screen.getByText("SecondTool")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /View on GitHub/i })).toHaveLength(2);
  });
});

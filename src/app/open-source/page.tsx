import { loadOpenSourceProjects } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Github, ExternalLink, Package } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Open Source",
  description:
    "Open source projects by Satori Canton — AI tooling, agent frameworks, and developer utilities.",
};

export default async function OpenSourcePage() {
  const projects = await loadOpenSourceProjects();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl font-normal mb-4 leading-tight">
          Open Source
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Projects I&apos;ve built and shipped publicly. Tools I use every day — so
          they stay maintained.
        </p>
      </div>

      <Separator className="mb-12 opacity-30" />

      {/* Project cards */}
      <div className="space-y-12">
        {projects.map((project) => (
          <div key={project.id}>
            {/* Project header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="font-serif text-3xl font-normal mb-1">
                  {project.name}
                </h2>
                {project.npmPackage && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Package className="h-3.5 w-3.5 shrink-0" />
                    <code className="font-mono">{project.npmPackage}</code>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="gap-2">
                    <Github className="h-4 w-4" />
                    View on GitHub
                  </Button>
                </a>
              </div>
            </div>

            {/* Tagline */}
            <p className="text-primary/80 font-medium mb-4 leading-relaxed">
              {project.tagline}
            </p>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed mb-6">
              {project.description}
            </p>

            {/* Highlights */}
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70 mb-3">
                Key Highlights
              </p>
              <ul className="space-y-2">
                {project.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies */}
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-xs font-normal">
                  {tech}
                </Badge>
              ))}
            </div>

            {/* Case story link */}
            {project.heroStoryId && (
              <Link
                href={`/story/${project.heroStoryId}`}
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Read the full case story
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

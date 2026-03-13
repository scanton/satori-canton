import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { loadHeroStory, loadStoryIndex } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import type { Metadata } from "next";

interface StoryPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const stories = await loadStoryIndex();
  return stories.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: StoryPageProps): Promise<Metadata> {
  const story = await loadHeroStory(params.id);
  if (!story) return {};
  return {
    title: story.title,
    description: story.subtitle,
  };
}

export default async function StoryPage({ params }: StoryPageProps) {
  const story = await loadHeroStory(params.id);
  if (!story) notFound();

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        All Case Stories
      </Link>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {story.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="text-xs font-normal">
            {tag}
          </Badge>
        ))}
      </div>

      {/* Title */}
      <h1 className="font-serif text-4xl sm:text-5xl font-normal mb-4 leading-tight">
        {story.title}
      </h1>

      {/* Subtitle */}
      <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
        {story.subtitle}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          {story.readingTimeMinutes} min read
        </span>
        <span>
          {new Date(story.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
          })}
        </span>
      </div>

      {/* Outcome highlight */}
      {story.outcome && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-strength-muted border border-strength/20 mb-8">
          <BookOpen className="h-4 w-4 text-strength mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-strength uppercase tracking-wide mb-1">
              Outcome
            </p>
            <p className="text-sm font-medium text-foreground">{story.outcome}</p>
          </div>
        </div>
      )}

      <Separator className="mb-8 opacity-30" />

      {/* MDX content */}
      <div className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:font-normal prose-headings:text-foreground prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4 prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:mb-8 prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary max-w-none">
        <MDXRemote source={story.content} />
      </div>

      <Separator className="my-10 opacity-30" />

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-accent/30 p-6 text-center">
        <h3 className="font-serif text-xl font-normal mb-2">
          Does this background fit your needs?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Paste your job description and get an honest AI-powered fit analysis.
        </p>
        <Link href="/job-fit">
          <Button className="gap-2">
            Evaluate Your Role
            <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
          </Button>
        </Link>
      </div>
    </article>
  );
}

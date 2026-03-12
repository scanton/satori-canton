import Link from "next/link";
import { BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { HeroStoryMeta } from "@/lib/types";

interface RelevantStoriesProps {
  storyIds: string[];
  allStories: HeroStoryMeta[];
}

export function RelevantStories({ storyIds, allStories }: RelevantStoriesProps) {
  const stories = storyIds
    .map((id) => allStories.find((s) => s.id === id))
    .filter((s): s is HeroStoryMeta => !!s);

  if (stories.length === 0) return null;

  return (
    <div className="space-y-3">
      {stories.map((story) => (
        <Link key={story.id} href={`/story/${story.id}`} className="group block">
          <div className="flex items-start gap-3 p-4 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-md">
            <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors mb-1">
                {story.title}
              </p>
              <p className="text-xs text-muted-foreground mb-2">{story.outcome}</p>
              <div className="flex flex-wrap gap-1">
                {story.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 shrink-0 mt-0.5" />
          </div>
        </Link>
      ))}
    </div>
  );
}

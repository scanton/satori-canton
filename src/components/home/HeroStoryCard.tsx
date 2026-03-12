"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BookOpen } from "lucide-react";
import type { HeroStoryMeta } from "@/lib/types";

interface HeroStoryCardProps {
  story: HeroStoryMeta;
  index: number;
}

export function HeroStoryCard({ story, index }: HeroStoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
    >
      <Link href={`/story/${story.id}`} className="group block">
        <article className="h-full rounded-xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {story.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <h2 className="font-serif text-xl font-normal mb-2 leading-snug group-hover:text-primary transition-colors">
            {story.title}
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {story.subtitle}
          </p>

          {/* Context */}
          <p className="text-xs text-muted-foreground/70 mb-4 italic">
            {story.companyContext}
          </p>

          {/* Outcome */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-strength-muted border border-strength/20 mb-4">
            <BookOpen className="h-3.5 w-3.5 text-strength mt-0.5 shrink-0" />
            <p className="text-xs text-strength font-medium leading-snug">
              {story.outcome}
            </p>
          </div>

          {/* Read more */}
          <div className="flex items-center gap-1 text-sm text-primary font-medium">
            <span>Read story</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

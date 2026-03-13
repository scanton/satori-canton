"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { ExperienceItem } from "@/lib/types";

interface ExperienceTimelineProps {
  experience: ExperienceItem[];
}

const employmentTypeLabel: Record<ExperienceItem["employmentType"], string> = {
  "full-time": "Full-time",
  contract: "Contract",
  consulting: "Consulting",
  fractional: "Fractional",
};

export function ExperienceTimeline({ experience }: ExperienceTimelineProps) {
  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-0 top-2 bottom-2 w-px bg-border/60 hidden sm:block" />

      <div className="space-y-10">
        {experience.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: "easeOut" }}
            className="sm:pl-8 relative"
          >
            {/* Timeline dot */}
            <div className="absolute left-0 top-1.5 w-px h-px hidden sm:block">
              <div className="w-2.5 h-2.5 rounded-full bg-primary border-2 border-background -translate-x-[5px]" />
            </div>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
              <div>
                <h3 className="font-serif text-xl font-normal">{exp.role}</h3>
                <p className="text-muted-foreground font-medium">{exp.company}</p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1 text-sm text-muted-foreground shrink-0">
                <span>
                  {formatDate(exp.startDate)} – {formatDate(exp.endDate)}
                </span>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-xs font-normal capitalize"
                  >
                    {employmentTypeLabel[exp.employmentType]}
                  </Badge>
                  <span className="text-xs">{exp.location}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
              {exp.summary}
            </p>

            {/* Highlights */}
            <ul className="space-y-1.5 mb-4">
              {exp.highlights.map((h, hi) => (
                <li
                  key={hi}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                  {h}
                </li>
              ))}
            </ul>

            {/* Skills */}
            <div className="flex flex-wrap gap-1.5">
              {exp.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="text-xs font-normal"
                >
                  {skill}
                </Badge>
              ))}
            </div>

            {/* Hero story links */}
            {exp.heroStoryIds && exp.heroStoryIds.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {exp.heroStoryIds.map((storyId) => (
                  <Link
                    key={storyId}
                    href={`/story/${storyId}`}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    See case story
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

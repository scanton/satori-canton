import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  loadProfile,
  loadExperience,
  loadEducation,
  loadSkills,
} from "@/lib/content";
import { ExperienceTimeline } from "@/components/resume/ExperienceTimeline";
import { SkillsSection } from "@/components/resume/SkillsSection";
import { EducationSection } from "@/components/resume/EducationSection";
import { PrintButton } from "@/components/resume/PrintButton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin, Mail, Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "Resume",
  description: "Work experience, skills, and education for Satori Canton, AI Consultant.",
};

export default async function ResumePage() {
  const [profile, experience, education, skills] = await Promise.all([
    loadProfile(),
    loadExperience(),
    loadEducation(),
    loadSkills(),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header row */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          {profile.avatar && (
            <Image
              src={profile.avatar}
              alt={profile.name}
              width={72}
              height={72}
              className="rounded-full ring-1 ring-border/60 object-cover shrink-0"
              priority
            />
          )}
          <div>
            <h1 className="font-serif text-4xl font-normal mb-1">{profile.name}</h1>
            <p className="text-lg text-muted-foreground">{profile.title}</p>
          </div>
        </div>
        <PrintButton />
      </div>

      {/* Contact */}
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-8">
        <a
          href={`mailto:${profile.contact.email}`}
          className="flex items-center gap-1.5 hover:text-foreground transition-colors"
        >
          <Mail className="h-3.5 w-3.5" />
          {profile.contact.email}
        </a>
        {profile.contact.linkedin && (
          <a
            href={profile.contact.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        )}
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" />
          {profile.contact.location}
        </span>
      </div>

      {/* Summary */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-normal mb-4">Summary</h2>
        <div className="space-y-3">
          {(profile.resumeSummary ?? profile.summary).split("\n\n").map((para, i) => (
            <p key={i} className="text-muted-foreground leading-relaxed">
              {para}
            </p>
          ))}
        </div>
      </section>

      <Separator className="mb-10 opacity-30" />

      {/* Experience */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-normal mb-8">Experience</h2>
        <ExperienceTimeline experience={experience} />
      </section>

      <Separator className="mb-10 opacity-30" />

      {/* Skills */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-normal mb-6">Skills</h2>
        <SkillsSection skills={skills} />
      </section>

      <Separator className="mb-10 opacity-30" />

      {/* Education */}
      <section className="mb-10">
        <h2 className="font-serif text-2xl font-normal mb-6">Education</h2>
        <EducationSection education={education} />
      </section>

      <Separator className="mb-10 opacity-30" />

      {/* CTA */}
      <div className="rounded-xl border border-primary/20 bg-accent/30 p-6 text-center no-print">
        <h3 className="font-serif text-xl font-normal mb-2">
          Want an AI-powered fit analysis?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Paste your job description and get an honest score with supporting
          evidence from these case stories.
        </p>
        <Link href="/job-fit">
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" />
            Evaluate Your Role
          </Button>
        </Link>
      </div>
    </div>
  );
}

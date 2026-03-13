import { loadProfile } from "@/lib/content";
import fs from "fs/promises";
import path from "path";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "AI consulting services: Fractional Head of AI, generative AI strategy, agent architecture, AI art direction, and Specification Engineering workshops.",
};

interface Service {
  id: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  idealFor: string;
  engagementType: string;
  order: number;
}

const engagementLabel: Record<string, string> = {
  fractional: "Fractional",
  project: "Project-based",
  workshop: "Workshop",
};

async function loadServices(): Promise<Service[]> {
  const raw = await fs.readFile(
    path.join(process.cwd(), "content", "services.json"),
    "utf-8"
  );
  const services = JSON.parse(raw) as Service[];
  return services.sort((a, b) => a.order - b.order);
}

export default async function ServicesPage() {
  const [services, profile] = await Promise.all([
    loadServices(),
    loadProfile(),
  ]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl font-normal mb-4 leading-tight">
          Services
        </h1>
        <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
          Engagements are available on a fractional, project, or workshop basis.
          Current bandwidth is limited — reach out early if timing matters.
        </p>
      </div>

      <Separator className="mb-12 opacity-30" />

      {/* Service cards */}
      <div className="space-y-10">
        {services.map((service) => (
          <div
            key={service.id}
            className="group rounded-xl border border-border/60 bg-card/30 p-7 hover:border-border transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
              <h2 className="font-serif text-2xl font-normal">{service.title}</h2>
              <Badge variant="outline" className="text-xs font-normal w-fit shrink-0">
                {engagementLabel[service.engagementType] ?? service.engagementType}
              </Badge>
            </div>

            <p className="text-primary/80 font-medium text-sm mb-4">
              {service.tagline}
            </p>

            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {service.description}
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70 mb-2">
                  Deliverables
                </p>
                <ul className="space-y-1.5">
                  {service.deliverables.map((d, di) => (
                    <li key={di} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70 mb-2">
                  Ideal For
                </p>
                <p className="text-sm text-muted-foreground">{service.idealFor}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Separator className="my-12 opacity-30" />

      {/* Contact CTA */}
      <div className="rounded-xl border border-primary/20 bg-accent/30 p-8">
        <h2 className="font-serif text-2xl font-normal mb-2">
          Let&apos;s talk about your situation.
        </h2>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          The best engagements start with a direct conversation about the actual
          problem. Reach out by email or SMS — no forms, no scheduling links.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a href={`mailto:${profile.contact.email}`}>
            <Button variant="default" className="gap-2 w-full sm:w-auto">
              <Mail className="h-4 w-4" />
              {profile.contact.email}
            </Button>
          </a>
          {profile.contact.phone && (
            <a href={`sms:${profile.contact.phone}`}>
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <MessageSquare className="h-4 w-4" />
                SMS {profile.contact.phone}
              </Button>
            </a>
          )}
        </div>
        <p className="text-xs text-muted-foreground/60 mt-4">
          Or paste your job description into the{" "}
          <Link href="/job-fit" className="underline hover:text-muted-foreground transition-colors">
            role evaluator
          </Link>{" "}
          for an AI-powered fit analysis.
        </p>
      </div>
    </div>
  );
}

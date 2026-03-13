import { loadProfile, loadStoryIndex } from "@/lib/content";
import { ProfileHero } from "@/components/home/ProfileHero";
import { HeroStoryCard } from "@/components/home/HeroStoryCard";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";

export default async function HomePage() {
  const [profile, stories] = await Promise.all([
    loadProfile(),
    loadStoryIndex(),
  ]);

  return (
    <>
      <ProfileHero profile={profile} />

      <Separator className="opacity-30" />

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="mb-10">
          <h2 className="font-serif text-3xl font-normal mb-3">Case Stories</h2>
          <p className="text-muted-foreground max-w-xl">
            Every claim on my resume is backed by a real story. These are the
            situations, the work, and the outcomes — unfiltered.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p>Case stories will appear here once added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {stories.map((story, i) => (
              <HeroStoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}
      </section>

      <Separator className="opacity-30" />

      {/* Contact CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-2xl">
          <h2 className="font-serif text-3xl font-normal mb-3">
            Working on something?
          </h2>
          <p className="text-muted-foreground mb-6 leading-relaxed">
            Open to fractional and project-based engagements. No forms, no scheduling links —
            just a direct conversation about the actual problem.
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
            <Link href="/services">
              <Button variant="ghost" className="gap-2 w-full sm:w-auto">
                View services →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

import Link from "next/link";
import { loadProfile } from "@/lib/content";

export async function Footer() {
  const profile = await loadProfile();

  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <span className="font-serif text-base text-foreground">
            Satori Canton
          </span>
          <span className="hidden sm:inline">·</span>
          <span>{profile.title}</span>
        </div>

        <div className="flex items-center gap-4">
          {profile.contact.linkedin && (
            <a
              href={profile.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              LinkedIn
            </a>
          )}
          {profile.contact.github && (
            <a
              href={profile.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              GitHub
            </a>
          )}
          <a
            href={`mailto:${profile.contact.email}`}
            className="hover:text-foreground transition-colors"
          >
            Contact
          </a>
          <Link
            href="/job-fit"
            className="hover:text-foreground transition-colors font-medium text-primary/80"
          >
            Evaluate Role →
          </Link>
        </div>
      </div>
    </footer>
  );
}

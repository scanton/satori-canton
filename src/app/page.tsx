import { loadProfile, loadStoryIndex } from "@/lib/content";
import { ProfileHero } from "@/components/home/ProfileHero";
import { HeroStoryCard } from "@/components/home/HeroStoryCard";
import { Separator } from "@/components/ui/separator";

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
          <h2 className="font-serif text-3xl font-normal mb-3">Hero Stories</h2>
          <p className="text-muted-foreground max-w-xl">
            Every claim on my resume is backed by a real story. These are the
            situations, the work, and the outcomes — unfiltered.
          </p>
        </div>

        {stories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground">
            <p>Hero stories will appear here once added.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {stories.map((story, i) => (
              <HeroStoryCard key={story.id} story={story} index={i} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery, skillsQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SectionHeader, SkillsSection } from "@/components/site/sections";
import { Award, Target, Eye, GraduationCap, Briefcase, Download } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Good News" },
      { name: "description", content: "About Good News — full-stack developer, designer, and product engineer." },
      { property: "og:title", content: "About Good News" },
      { property: "og:description", content: "Full-stack developer, designer, and product engineer." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(skillsQuery),
    ]);
  },
  component: AboutPage,
});

function AboutPage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: skills } = useSuspenseQuery(skillsQuery);

  return (
    <SiteLayout profile={profile}>
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <SectionHeader eyebrow="About Me" title={profile?.name ?? "Good News"} subtitle={profile?.title ?? undefined} />

          <div className="mt-16 grid gap-10 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="aspect-square rounded-3xl bg-gradient-primary shadow-glow-lg overflow-hidden">
                {profile?.photo_url ? (
                  <img src={profile.photo_url} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full grid place-items-center text-8xl font-bold text-white/40 font-[family-name:var(--font-display)]">
                    {(profile?.name ?? "G").charAt(0)}
                  </div>
                )}
              </div>
              {profile?.cv_url && (
                <a href={profile.cv_url} download className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition w-full justify-center">
                  <Download className="h-4 w-4" /> Download CV
                </a>
              )}
            </div>

            <div className="md:col-span-2">
              <h3 className="text-2xl font-[family-name:var(--font-display)] font-bold">Biography</h3>
              <p className="mt-4 text-muted-foreground leading-relaxed whitespace-pre-line">{profile?.bio}</p>

              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                <InfoCard icon={Target} title="Mission" body={profile?.mission ?? ""} />
                <InfoCard icon={Eye} title="Vision" body={profile?.vision ?? ""} />
              </div>

              <div className="mt-10 space-y-3">
                <TimelineItem icon={Briefcase} title="Senior Full-Stack Engineer" sub="Freelance · 2022 — Present" desc="Shipping products for startups and agencies worldwide." />
                <TimelineItem icon={Briefcase} title="Full-Stack Developer" sub="Independent · 2020 — 2022" desc="Delivered 30+ web and mobile products end-to-end." />
                <TimelineItem icon={GraduationCap} title="B.Sc. Computer Science" sub="2016 — 2020" desc="Focus on distributed systems and human-computer interaction." />
                <TimelineItem icon={Award} title="Multiple Client Awards" sub="2021 — 2024" desc="Recognized for delivery speed, code quality, and design polish." />
              </div>
            </div>
          </div>
        </div>
      </section>

      <SkillsSection skills={skills ?? []} />
    </SiteLayout>
  );
}

function InfoCard({ icon: Icon, title, body }: { icon: React.ComponentType<{ className?: string }>; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-gradient-card border border-border/60 p-5 card-hover">
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <h4 className="mt-4 font-semibold">{title}</h4>
      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

function TimelineItem({ icon: Icon, title, sub, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; sub: string; desc: string }) {
  return (
    <div className="flex gap-4 rounded-2xl bg-gradient-card border border-border/60 p-5 card-hover">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-primary shadow-glow">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-gradient font-medium">{sub}</div>
        <div className="mt-1 text-sm text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

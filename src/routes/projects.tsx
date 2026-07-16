import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { profileQuery, projectsQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SectionHeader, ProjectCard } from "@/components/site/sections";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects — Good News" },
      { name: "description", content: "Selected work across mobile, web, software, and AI." },
      { property: "og:title", content: "Projects — Good News" },
      { property: "og:description", content: "Selected work across mobile, web, and AI." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(projectsQuery),
    ]);
  },
  component: ProjectsPage,
});

function ProjectsPage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const [filter, setFilter] = useState<string>("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    (projects ?? []).forEach((p) => p.category && set.add(p.category));
    return ["All", ...Array.from(set)];
  }, [projects]);

  const filtered = filter === "All" ? projects ?? [] : (projects ?? []).filter((p) => p.category === filter);

  return (
    <SiteLayout profile={profile}>
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader eyebrow="Portfolio" title="All Projects" subtitle="A tour of recent work — from indie mobile apps to enterprise platforms." />

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={cn(
                  "rounded-full px-4 py-2 text-xs font-medium transition-all",
                  filter === c
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "glass hover:bg-surface"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

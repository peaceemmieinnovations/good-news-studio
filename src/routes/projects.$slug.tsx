import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery, projectBySlugQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SiteNotFound } from "@/components/site/not-found";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/projects/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(projectBySlugQuery(params.slug));
    if (!data) throw notFound();
    await context.queryClient.ensureQueryData(profileQuery);
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Good News` },
          { name: "description", content: loaderData.description ?? "" },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description ?? "" },
          ...(loaderData.cover_url ? [{ property: "og:image", content: loaderData.cover_url }] : []),
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: SiteNotFound,
  errorComponent: SiteNotFound,
  component: ProjectDetail,
});

function ProjectDetail() {
  const p = Route.useLoaderData();
  const { data: profile } = useSuspenseQuery(profileQuery);
  return (
    <SiteLayout profile={profile}>
      <article className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> All projects
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="rounded-full glass px-3 py-1 text-xs font-medium">{p.category}</span>
            {p.status && <span className="rounded-full glass px-3 py-1 text-xs font-medium">{p.status}</span>}
          </div>

          <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl md:text-6xl font-bold tracking-tight">
            {p.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">{p.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {p.live_url && (
              <a href={p.live_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition">
                Live demo <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {p.github_url && (
              <a href={p.github_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl glass px-5 py-2.5 text-sm font-semibold hover:bg-surface transition">
                <Github className="h-4 w-4" /> GitHub
              </a>
            )}
          </div>

          {p.cover_url && (
            <img src={p.cover_url} alt={p.title} className="mt-10 rounded-3xl w-full aspect-[16/9] object-cover shadow-elevated" />
          )}

          {p.long_description && (
            <div className="mt-10 prose prose-invert max-w-none">
              <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{p.long_description}</p>
            </div>
          )}

          {p.technologies.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Built with</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {p.technologies.map((t) => (
                  <span key={t} className="rounded-lg glass px-3 py-1.5 text-sm">{t}</span>
                ))}
              </div>
            </div>
          )}

          {p.images.length > 0 && (
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {p.images.map((src) => (
                <img key={src} src={src} alt="" className="rounded-2xl w-full aspect-video object-cover shadow-card" />
              ))}
            </div>
          )}
        </div>
      </article>
    </SiteLayout>
  );
}

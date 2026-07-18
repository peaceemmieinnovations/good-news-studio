import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery, serviceByIdQuery, servicesQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SiteNotFound } from "@/components/site/not-found";
import { ArrowLeft, ArrowRight, Check, Clock, Sparkles } from "lucide-react";
import {
  Smartphone, Globe, Code2, Palette, Plug, Database, Zap,
} from "lucide-react";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone, Globe, Code2, Palette, Plug, Database, Zap,
};

export const Route = createFileRoute("/services/$id")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(serviceByIdQuery(params.id));
    if (!data) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(servicesQuery),
    ]);
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Services — Good News` },
          { name: "description", content: loaderData.description ?? "" },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.description ?? "" },
          { property: "og:type", content: "website" },
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: SiteNotFound,
  errorComponent: SiteNotFound,
  component: ServiceDetail,
});

function ServiceDetail() {
  const s = Route.useLoaderData();
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: allServices } = useSuspenseQuery(servicesQuery);
  const Icon = (s.icon ? ICONS[s.icon] : null) ?? Zap;
  const related = (allServices ?? []).filter((x) => x.id !== s.id).slice(0, 3);

  return (
    <SiteLayout profile={profile}>
      <article className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Link to="/services" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> All services
          </Link>

          <div className="mt-8 flex items-start gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-primary shadow-glow">
              <Icon className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">{s.title}</h1>
              <p className="mt-3 text-lg text-muted-foreground">{s.description}</p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {s.price && (
              <div className="rounded-2xl bg-gradient-card border border-border/60 p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Starting at</div>
                <div className="mt-2 text-3xl font-bold text-gradient">{s.price}</div>
              </div>
            )}
            {s.duration && (
              <div className="rounded-2xl bg-gradient-card border border-border/60 p-6">
                <div className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Typical timeline
                </div>
                <div className="mt-2 text-3xl font-bold">{s.duration}</div>
              </div>
            )}
          </div>

          <div className="mt-10 rounded-2xl bg-gradient-card border border-border/60 p-8">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">What's included</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {[
                "Discovery & requirements workshop",
                "Clean, maintainable code",
                "Modern, responsive design",
                "Performance & SEO optimization",
                "Post-launch support",
                "Clear milestones & pricing",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 transition">
              Start a project <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/projects" className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold hover:bg-surface transition">
              See recent work
            </Link>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-6">Related services</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {related.map((r) => {
                  const RIcon = (r.icon ? ICONS[r.icon] : null) ?? Zap;
                  return (
                    <Link key={r.id} to="/services/$id" params={{ id: r.id }} className="rounded-2xl bg-gradient-card border border-border/60 p-5 card-hover">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow">
                        <RIcon className="h-4 w-4 text-primary-foreground" />
                      </div>
                      <div className="mt-3 font-semibold">{r.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.description}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </article>
    </SiteLayout>
  );
}

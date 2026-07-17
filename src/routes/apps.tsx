import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery, appsQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SectionHeader } from "@/components/site/sections";
import { Download, Package, Calendar } from "lucide-react";

export const Route = createFileRoute("/apps")({
  head: () => ({
    meta: [
      { title: "Apps — Good News" },
      { name: "description", content: "Download the latest Android APK for apps by Good News." },
      { property: "og:title", content: "Mobile Apps — Good News" },
      { property: "og:description", content: "Download the latest Android APK." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(appsQuery),
    ]);
  },
  component: AppsPage,
});

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function AppsPage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: apps } = useSuspenseQuery(appsQuery);

  return (
    <SiteLayout profile={profile}>
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader eyebrow="Downloads" title="Mobile Apps" subtitle="Direct APK downloads. No app store required." />

          {(apps ?? []).length === 0 ? (
            <div className="mt-16 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>No apps published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {(apps ?? []).map((a, i) => (
                <Link
                  key={a.id}
                  to="/apps/$slug"
                  params={{ slug: a.slug }}
                  className="group relative overflow-hidden rounded-3xl bg-gradient-card border border-border/60 p-6 card-hover animate-fade-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start gap-5">
                    {a.logo_url ? (
                      <img src={a.logo_url} alt={a.name} className="h-20 w-20 rounded-2xl object-cover shadow-glow" />
                    ) : (
                      <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-primary shadow-glow text-3xl font-bold text-primary-foreground">
                        {a.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-semibold group-hover:text-gradient transition">{a.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{a.tagline ?? a.requirements}</p>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> v{a.version}</span>
                        <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" /> {a.download_count} downloads</span>
                        <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatBytes(a.apk_size_bytes)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                  <div className="mt-5 flex items-center justify-between pt-5 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">
                      {a.released_at ? new Date(a.released_at).toLocaleDateString() : ""}
                    </span>
                    <span className="text-sm font-semibold text-gradient inline-flex items-center gap-1">
                      View & Download <Download className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </SiteLayout>
  );
}

import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery, appBySlugQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SiteNotFound } from "@/components/site/not-found";
import { ArrowLeft, Download, Package, ExternalLink, Check } from "lucide-react";
import { trackDownload } from "@/lib/public.functions";
import { useState } from "react";

export const Route = createFileRoute("/apps/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(appBySlugQuery(params.slug));
    if (!data) throw notFound();
    await context.queryClient.ensureQueryData(profileQuery);
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Download APK` },
          { name: "description", content: loaderData.description ?? "" },
          { property: "og:title", content: loaderData.name },
          { property: "og:description", content: loaderData.description ?? "" },
          ...(loaderData.banner_url || loaderData.logo_url ? [{ property: "og:image", content: loaderData.banner_url ?? loaderData.logo_url! }] : []),
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: SiteNotFound,
  errorComponent: SiteNotFound,
  component: AppDetail,
});

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "—";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AppDetail() {
  const a = Route.useLoaderData();
  const { data: profile } = useSuspenseQuery(profileQuery);
  const track = useServerFn(trackDownload);
  const [downloading, setDownloading] = useState(false);

  async function handleDownload(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!a.apk_url) return;
    setDownloading(true);
    try { await track({ data: { app_id: a.id, version: a.version ?? undefined } }); } catch {}
    setDownloading(false);
    // Native browser download continues via the href
  }

  return (
    <SiteLayout profile={profile}>
      <article className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Link to="/apps" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> All apps
          </Link>

          <div className="mt-8 flex flex-col sm:flex-row gap-6 items-start">
            {a.logo_url ? (
              <img src={a.logo_url} alt={a.name} className="h-28 w-28 rounded-3xl object-cover shadow-glow-lg" />
            ) : (
              <div className="grid h-28 w-28 place-items-center rounded-3xl bg-gradient-primary shadow-glow-lg text-4xl font-bold text-primary-foreground">
                {a.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight">{a.name}</h1>
              {a.tagline && <p className="mt-2 text-lg text-muted-foreground">{a.tagline}</p>}
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Package className="h-4 w-4" /> v{a.version}</span>
                <span>{formatBytes(a.apk_size_bytes)}</span>
                <span>{a.requirements}</span>
                <span>{a.download_count} downloads</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {a.apk_url ? (
              <a
                href={a.apk_url}
                onClick={handleDownload}
                download
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-[1.02] transition"
              >
                <Download className="h-4 w-4" />
                {downloading ? "Preparing…" : `Download APK · v${a.version}`}
              </a>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold opacity-60">
                APK not yet uploaded
              </span>
            )}
            {a.play_store_url && (
              <a href={a.play_store_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold hover:bg-surface transition">
                Play Store <ExternalLink className="h-4 w-4" />
              </a>
            )}
            {a.website_url && (
              <a href={a.website_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold hover:bg-surface transition">
                Website <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>

          {a.banner_url && (
            <img src={a.banner_url} alt={a.name} className="mt-10 rounded-3xl w-full aspect-[16/8] object-cover shadow-elevated" />
          )}

          {a.description && (
            <div className="mt-10">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">About</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed whitespace-pre-line">{a.description}</p>
            </div>
          )}

          {a.features.length > 0 && (
            <div className="mt-10">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">Features</h3>
              <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                {a.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 rounded-xl glass p-3">
                    <Check className="h-4 w-4 mt-0.5 text-accent shrink-0" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {a.release_notes && (
            <div className="mt-10 rounded-2xl bg-gradient-card border border-border/60 p-6">
              <h3 className="font-semibold">Release Notes · v{a.version}</h3>
              <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{a.release_notes}</p>
            </div>
          )}

          {a.screenshots.length > 0 && (
            <div className="mt-10">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-bold">Screenshots</h3>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
                {a.screenshots.map((s: string) => (
                  <img key={s} src={s} alt="" className="h-96 w-auto rounded-2xl shadow-card shrink-0" />
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    </SiteLayout>
  );
}

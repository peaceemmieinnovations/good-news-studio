import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery, blogBySlugQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SiteNotFound } from "@/components/site/not-found";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(blogBySlugQuery(params.slug));
    if (!data || !data.is_published) throw notFound();
    await context.queryClient.ensureQueryData(profileQuery);
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Blog` },
          { name: "description", content: loaderData.excerpt ?? "" },
          { property: "og:title", content: loaderData.title },
          { property: "og:description", content: loaderData.excerpt ?? "" },
          ...(loaderData.cover_url ? [{ property: "og:image", content: loaderData.cover_url }] : []),
        ]
      : [{ title: "Not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: SiteNotFound,
  errorComponent: SiteNotFound,
  component: PostDetail,
});

function PostDetail() {
  const p = Route.useLoaderData();
  const { data: profile } = useSuspenseQuery(profileQuery);
  return (
    <SiteLayout profile={profile}>
      <article className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-4 w-4" /> All posts
          </Link>
          <div className="mt-6 text-xs uppercase tracking-widest text-gradient font-semibold">{p.category}</div>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">{p.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{p.excerpt}</p>
          <div className="mt-4 text-xs text-muted-foreground">
            {p.published_at && new Date(p.published_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })} · {p.read_minutes} min read
          </div>
          {p.cover_url && <img src={p.cover_url} alt={p.title} className="mt-8 rounded-3xl w-full aspect-[16/9] object-cover shadow-elevated" />}
          <div className="mt-10 prose prose-invert max-w-none">
            <div className="text-foreground/90 leading-relaxed whitespace-pre-line">{p.content}</div>
          </div>
          {p.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {p.tags.map((t: string) => (
                <span key={t} className="rounded-lg glass px-3 py-1.5 text-xs">#{t}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    </SiteLayout>
  );
}

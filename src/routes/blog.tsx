import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery, blogPostsQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SectionHeader } from "@/components/site/sections";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Good News" },
      { name: "description", content: "Thoughts on engineering, design, and shipping products." },
      { property: "og:title", content: "Blog — Good News" },
      { property: "og:description", content: "Thoughts on engineering, design, and shipping products." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(blogPostsQuery),
    ]);
  },
  component: BlogPage,
});

function BlogPage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: posts } = useSuspenseQuery(blogPostsQuery);
  return (
    <SiteLayout profile={profile}>
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4">
          <SectionHeader eyebrow="Journal" title="Writing" subtitle="Long-form thoughts on building, shipping, and design." />

          <div className="mt-12 space-y-4">
            {(posts ?? []).map((p, i) => (
              <Link
                key={p.id}
                to="/blog/$slug"
                params={{ slug: p.slug }}
                className="block group rounded-2xl bg-gradient-card border border-border/60 p-6 card-hover animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="text-xs uppercase tracking-widest text-gradient font-semibold">{p.category}</div>
                <h3 className="mt-2 text-xl md:text-2xl font-[family-name:var(--font-display)] font-bold group-hover:text-gradient transition">
                  {p.title}
                </h3>
                <p className="mt-2 text-muted-foreground">{p.excerpt}</p>
                <div className="mt-4 text-xs text-muted-foreground flex gap-2">
                  {p.published_at && <span>{new Date(p.published_at).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>}
                  <span>·</span>
                  <span>{p.read_minutes} min read</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

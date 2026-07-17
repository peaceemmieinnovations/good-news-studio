import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Download, Sparkles, Star, Github, ExternalLink,
  Smartphone, Globe, Code2, Palette, Plug, Database, Zap
} from "lucide-react";
import type {
  ProfileRow, ServiceRow, SkillRow, ProjectRow, TestimonialRow, AppRow, BlogPostRow
} from "@/lib/queries";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Smartphone, Globe, Code2, Palette, Plug, Database, Zap,
};

// Typing effect
function useTypewriter(words: string[], speed = 90, delay = 1400) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), delay);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % words.length);
      return;
    }
    const t = setTimeout(() => {
      setText((prev) => deleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1));
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [text, deleting, wordIdx, words, speed, delay]);

  return text;
}

export function Hero({ profile }: { profile: ProfileRow | null }) {
  const word = useTypewriter([
    "Mobile Apps",
    "Beautiful Websites",
    "Scalable Software",
    "UI/UX Design",
    "Powerful APIs",
  ]);

  return (
    <section className="relative overflow-hidden pt-8 pb-20">
      <div className="absolute inset-0 grid-bg pointer-events-none" />

      {/* floating orbs */}
      <div className="absolute top-20 -left-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div className="absolute bottom-10 -right-20 h-96 w-96 rounded-full bg-[oklch(0.62_0.24_300/0.15)] blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-fade-up inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Available for new projects
          </div>

          <h1 className="mt-6 animate-fade-up font-[family-name:var(--font-display)] text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05]" style={{ animationDelay: "0.1s" }}>
            Hi, I'm <span className="text-gradient animate-gradient bg-[length:200%_200%]">{profile?.name ?? "Good News"}</span>
          </h1>

          <div className="mt-6 h-10 animate-fade-up text-2xl sm:text-3xl font-medium text-muted-foreground" style={{ animationDelay: "0.2s" }}>
            I build{" "}
            <span className="text-gradient font-semibold">
              {word}
              <span className="inline-block w-0.5 h-6 sm:h-8 bg-primary ml-1 align-middle animate-pulse" />
            </span>
          </div>

          <p className="mt-6 animate-fade-up mx-auto max-w-xl text-lg text-muted-foreground" style={{ animationDelay: "0.3s" }}>
            {profile?.tagline ?? "Building digital products that grow businesses."} From idea to launch, I ship polished software with obsessive attention to detail.
          </p>

          <div className="mt-10 animate-fade-up flex flex-wrap items-center justify-center gap-3" style={{ animationDelay: "0.4s" }}>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-[1.02] transition-all"
            >
              Hire Me
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold hover:bg-surface transition-all"
            >
              View Projects
            </Link>
            <Link
              to="/apps"
              className="inline-flex items-center gap-2 rounded-xl glass px-6 py-3 text-sm font-semibold hover:bg-surface transition-all"
            >
              <Download className="h-4 w-4" />
              Download App
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 animate-fade-up grid grid-cols-2 md:grid-cols-4 gap-4" style={{ animationDelay: "0.5s" }}>
          <StatCard label="Years Experience" value={profile?.years_experience ?? 5} suffix="+" />
          <StatCard label="Projects Shipped" value={profile?.projects_completed ?? 50} suffix="+" />
          <StatCard label="Happy Clients" value={profile?.happy_clients ?? 30} suffix="+" />
          <StatCard label="Technologies" value={20} suffix="+" />
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl glass p-6 text-center card-hover">
      <div className="text-3xl md:text-4xl font-bold text-gradient font-[family-name:var(--font-display)]">
        {value}{suffix}
      </div>
      <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}

export function ServicesSection({ services }: { services: ServiceRow[] }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="What I Do" title="Services" subtitle="End-to-end product development, from first sketch to production." />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = (s.icon ? ICONS[s.icon] : null) ?? Zap;
            return (
              <div
                key={s.id}
                className="group rounded-2xl bg-gradient-card border border-border/60 p-6 card-hover animate-fade-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-primary shadow-glow group-hover:animate-glow-pulse">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                {s.price && (
                  <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Starting at</span>
                    <span className="font-semibold text-gradient">{s.price}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function SkillsSection({ skills }: { skills: SkillRow[] }) {
  return (
    <section className="py-24 relative">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Toolkit" title="Skills & Expertise" subtitle="The tools I reach for to build great products." />
        <div className="mt-12 grid gap-x-8 gap-y-6 md:grid-cols-2">
          {skills.map((s, i) => (
            <div key={s.id} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{s.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{s.percentage}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-primary shadow-glow transition-all duration-1000"
                  style={{ width: `${s.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectsSection({ projects, title = "Featured Projects", showAll = false }: { projects: ProjectRow[]; title?: string; showAll?: boolean }) {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHeader eyebrow="Selected Work" title={title} subtitle="A few products I'm proud to have shipped." align="left" />
          {!showAll && (
            <Link to="/projects" className="text-sm font-medium text-gradient inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function ProjectCard({ project: p, index = 0 }: { project: ProjectRow; index?: number }) {
  return (
    <Link
      to="/projects/$slug"
      params={{ slug: p.slug }}
      className="group animate-fade-up rounded-2xl bg-gradient-card border border-border/60 overflow-hidden card-hover"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="aspect-[16/10] relative overflow-hidden bg-surface">
        {p.cover_url ? (
          <img src={p.cover_url} alt={p.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="h-full w-full bg-gradient-primary opacity-40 grid place-items-center">
            <div className="text-6xl font-bold text-white/30 font-[family-name:var(--font-display)]">
              {p.title.charAt(0)}
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="rounded-full glass px-3 py-1 text-xs font-medium">{p.category}</span>
        </div>
        {p.is_featured && (
          <div className="absolute top-3 right-3">
            <span className="rounded-full bg-gradient-primary shadow-glow px-3 py-1 text-xs font-medium text-primary-foreground inline-flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Featured
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="font-semibold text-lg group-hover:text-gradient transition-all">{p.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.description}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.technologies.slice(0, 4).map((t) => (
            <span key={t} className="text-[10px] uppercase tracking-wider rounded-md bg-surface px-2 py-1 text-muted-foreground">{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function TestimonialsSection({ items }: { items: TestimonialRow[] }) {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeader eyebrow="Kind Words" title="What Clients Say" subtitle="Trusted by founders, teams, and indie creators worldwide." />
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {items.map((t, i) => (
            <div
              key={t.id}
              className="rounded-2xl bg-gradient-card border border-border/60 p-6 card-hover animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: t.rating ?? 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">"{t.message}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-primary-foreground font-semibold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[t.role, t.company, t.country].filter(Boolean).join(" · ")}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AppsPreview({ apps }: { apps: AppRow[] }) {
  if (apps.length === 0) return null;
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHeader eyebrow="Mobile Apps" title="Available for Download" subtitle="Grab the latest APK — no store, no waiting." align="left" />
          <Link to="/apps" className="text-sm font-medium text-gradient inline-flex items-center gap-1 hover:gap-2 transition-all">
            All apps <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {apps.slice(0, 3).map((a, i) => (
            <Link
              key={a.id}
              to="/apps/$slug"
              params={{ slug: a.slug }}
              className={cn(
                "group rounded-2xl bg-gradient-card border border-border/60 p-6 card-hover animate-fade-up"
              )}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-start gap-4">
                {a.logo_url ? (
                  <img src={a.logo_url} alt={a.name} className="h-14 w-14 rounded-xl object-cover shadow-glow" />
                ) : (
                  <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-primary shadow-glow font-bold text-primary-foreground">
                    {a.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold group-hover:text-gradient transition">{a.name}</h3>
                  <div className="mt-0.5 text-xs text-muted-foreground">v{a.version} · {a.download_count} downloads</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground line-clamp-2">{a.description}</p>
              <div className="mt-4 flex items-center justify-between pt-4 border-t border-border/40">
                <span className="text-xs text-muted-foreground">{a.requirements}</span>
                <span className="text-xs font-semibold text-gradient inline-flex items-center gap-1">
                  Download <Download className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogPreview({ posts }: { posts: BlogPostRow[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHeader eyebrow="Journal" title="Latest Writing" subtitle="Thoughts on engineering, design, and shipping products." align="left" />
          <Link to="/blog" className="text-sm font-medium text-gradient inline-flex items-center gap-1 hover:gap-2 transition-all">
            All posts <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {posts.slice(0, 3).map((p, i) => (
            <Link
              key={p.id}
              to="/blog/$slug"
              params={{ slug: p.slug }}
              className="group rounded-2xl bg-gradient-card border border-border/60 p-6 card-hover animate-fade-up"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="text-xs uppercase tracking-widest text-muted-foreground">{p.category}</div>
              <h3 className="mt-3 font-semibold group-hover:text-gradient transition line-clamp-2">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.excerpt}</p>
              <div className="mt-5 text-xs text-muted-foreground flex items-center gap-2">
                {p.published_at && <span>{new Date(p.published_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>}
                <span>·</span>
                <span>{p.read_minutes} min read</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="relative overflow-hidden rounded-3xl glass-strong p-10 md:p-16 text-center">
          <div className="absolute inset-0 bg-gradient-primary opacity-10" />
          <div className="absolute -top-20 -left-20 h-60 w-60 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-[oklch(0.62_0.24_300/0.3)] blur-3xl" />
          <div className="relative">
            <h2 className="font-[family-name:var(--font-display)] text-3xl md:text-5xl font-bold tracking-tight">
              Have a project in mind?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Let's build something the world will love. I usually reply within 24 hours.
            </p>
            <Link
              to="/contact"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-[1.02] transition"
            >
              Start a project <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionHeader({ eyebrow, title, subtitle, align = "center" }: {
  eyebrow?: string; title: string; subtitle?: string; align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center", align === "center" && "mx-auto max-w-2xl")}>
      {eyebrow && (
        <div className={cn("text-xs uppercase tracking-[0.2em] font-semibold text-gradient", align === "center" && "text-center")}>
          {eyebrow}
        </div>
      )}
      <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl md:text-5xl font-bold tracking-tight">
        {title}
      </h2>
      {subtitle && <p className="mt-4 text-muted-foreground text-lg">{subtitle}</p>}
    </div>
  );
}

export { Github, ExternalLink };

import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQueries } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard } from "@/components/admin/ui";
import {
  projectsQuery, appsQuery, servicesQuery, skillsQuery,
  blogPostsQuery, testimonialsQuery, messagesQuery,
} from "@/lib/queries";
import { Briefcase, Smartphone, Wrench, Award, FileText, Star, MessageSquare, Download } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Dashboard — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const [projects, apps, services, skills, posts, testimonials, messages] = useSuspenseQueries({
    queries: [projectsQuery, appsQuery, servicesQuery, skillsQuery, blogPostsQuery, testimonialsQuery, messagesQuery],
  });

  const totalDownloads = (apps.data ?? []).reduce((sum, a) => sum + (a.download_count ?? 0), 0);
  const unread = (messages.data ?? []).filter((m) => !m.is_read).length;

  const stats = [
    { label: "Projects", value: projects.data?.length ?? 0, icon: Briefcase, to: "/admin/projects" },
    { label: "Apps", value: apps.data?.length ?? 0, icon: Smartphone, to: "/admin/apps" },
    { label: "Services", value: services.data?.length ?? 0, icon: Wrench, to: "/admin/services" },
    { label: "Skills", value: skills.data?.length ?? 0, icon: Award, to: "/admin/skills" },
    { label: "Blog Posts", value: posts.data?.length ?? 0, icon: FileText, to: "/admin/blog" },
    { label: "Testimonials", value: testimonials.data?.length ?? 0, icon: Star, to: "/admin/testimonials" },
    { label: "Messages", value: messages.data?.length ?? 0, icon: MessageSquare, to: "/admin/messages", badge: unread },
    { label: "APK Downloads", value: totalDownloads, icon: Download, to: "/admin/apps" },
  ] as const;

  return (
    <AdminShell>
      <AdminPageHeader title="Dashboard" description="Overview of your portfolio content." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          const content = (
            <AdminCard className="card-hover">
              <div className="flex items-center justify-between">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                {"badge" in s && s.badge > 0 && (
                  <span className="rounded-full bg-destructive text-destructive-foreground text-xs px-2 py-0.5 font-semibold">
                    {s.badge} new
                  </span>
                )}
              </div>
              <div className="mt-4 text-3xl font-bold font-[family-name:var(--font-display)]">{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </AdminCard>
          );
          return "to" in s && s.to ? (
            <Link key={s.label} to={s.to}>{content}</Link>
          ) : (
            <div key={s.label}>{content}</div>
          );
        })}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <h3 className="font-semibold mb-4">Recent Messages</h3>
          {(messages.data ?? []).slice(0, 5).map((m) => (
            <div key={m.id} className="py-3 border-b border-border/40 last:border-0 flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-primary text-primary-foreground text-sm font-semibold">
                {m.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{m.name}</div>
                <div className="text-xs text-muted-foreground truncate">{m.subject || m.message}</div>
              </div>
              {!m.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
            </div>
          ))}
          {(messages.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        </AdminCard>

        <AdminCard>
          <h3 className="font-semibold mb-4">Top Apps by Downloads</h3>
          {(apps.data ?? []).slice(0, 5).sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0)).map((a) => (
            <div key={a.id} className="py-3 border-b border-border/40 last:border-0 flex items-center gap-3">
              {a.logo_url ? (
                <img src={a.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
              ) : (
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground text-sm font-semibold">
                  {a.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{a.name}</div>
                <div className="text-xs text-muted-foreground">v{a.version}</div>
              </div>
              <div className="text-sm font-semibold text-gradient">{a.download_count}</div>
            </div>
          ))}
          {(apps.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No apps yet.</p>}
        </AdminCard>
      </div>
    </AdminShell>
  );
}

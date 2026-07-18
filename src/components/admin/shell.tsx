import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, User, Briefcase, Smartphone, Wrench, Award,
  Image as ImageIcon, FileText, MessageSquare, Star, LogOut, Menu, X, Code2, Users, Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const nav: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/profile", label: "Profile", icon: User },
  { to: "/admin/projects", label: "Projects", icon: Briefcase },
  { to: "/admin/apps", label: "Apps", icon: Smartphone },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/skills", label: "Skills", icon: Award },
  { to: "/admin/blog", label: "Blog", icon: FileText },
  { to: "/admin/testimonials", label: "Testimonials", icon: Star },
  { to: "/admin/gallery", label: "Gallery", icon: ImageIcon },
  { to: "/admin/messages", label: "Messages", icon: MessageSquare },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/ai", label: "AI Assistant", icon: Sparkles },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [email, setEmail] = useState<string>("");

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 border-r border-border/60 bg-background/90 backdrop-blur-xl transition-transform lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-border/60">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-primary shadow-glow">
              <Code2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-[family-name:var(--font-display)] font-bold">Admin</span>
          </Link>
          <button className="lg:hidden p-2" onClick={() => setOpen(false)}><X className="h-4 w-4" /></button>
        </div>
        <nav className="p-3 space-y-1">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to as never}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition",
                  active ? "bg-gradient-primary text-primary-foreground shadow-glow" : "hover:bg-surface text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 inset-x-0 p-3 border-t border-border/60">
          <div className="text-xs text-muted-foreground truncate px-3 mb-2">{email}</div>
          <button
            onClick={signOut}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 min-w-0">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-border/60 sticky top-0 z-20 bg-background/80 backdrop-blur">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="flex-1" />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition">View site →</Link>
        </header>
        <div className="p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}

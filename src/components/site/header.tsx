import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/projects", label: "Projects" },
  { to: "/apps", label: "Apps" },
  { to: "/blog", label: "Blog" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className={cn(
          "flex items-center justify-between rounded-2xl px-4 py-3 transition-all",
          scrolled ? "glass-strong shadow-elevated" : "glass"
        )}>
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/favicon.png" alt="Good News" className="h-9 w-9 rounded-lg group-hover:scale-105 transition drop-shadow-[0_0_12px_oklch(0.65_0.24_275/0.5)]" />
            <span className="font-[family-name:var(--font-display)] font-bold text-lg tracking-tight">Good News</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-all relative",
                  pathname === n.to
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                activeProps={{ className: "text-foreground" }}
              >
                {n.label}
                {pathname === n.to && (
                  <span className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-gradient-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/contact"
              className="rounded-lg bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow hover:opacity-90 hover:scale-[1.02] transition"
            >
              Hire Me
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-surface transition"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden mt-2 rounded-2xl glass-strong p-2 animate-fade-up">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="block px-4 py-3 text-sm font-medium rounded-lg hover:bg-surface transition"
              >
                {n.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="block mt-2 text-center rounded-lg bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Hire Me
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

import { Link } from "@tanstack/react-router";
import { Github, Linkedin, Twitter, Instagram, Mail } from "lucide-react";
import type { ProfileRow } from "@/lib/queries";

export function SiteFooter({ profile }: { profile?: ProfileRow | null }) {
  const social = (profile?.social as Record<string, string>) ?? {};
  return (
    <footer className="border-t border-border/60 mt-32">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2">
              <img src="/favicon.png" alt="Good News" className="h-9 w-9 rounded-lg drop-shadow-[0_0_12px_oklch(0.65_0.24_275/0.5)]" />
              <span className="font-[family-name:var(--font-display)] font-bold text-xl">Good News</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground max-w-sm">
              {profile?.tagline ?? "Building digital products that grow businesses."}
            </p>
            <div className="mt-6 flex gap-2">
              {social.github && <SocialLink href={social.github}><Github className="h-4 w-4" /></SocialLink>}
              {social.linkedin && <SocialLink href={social.linkedin}><Linkedin className="h-4 w-4" /></SocialLink>}
              {social.twitter && <SocialLink href={social.twitter}><Twitter className="h-4 w-4" /></SocialLink>}
              {social.instagram && <SocialLink href={social.instagram}><Instagram className="h-4 w-4" /></SocialLink>}
              {profile?.email && <SocialLink href={`mailto:${profile.email}`}><Mail className="h-4 w-4" /></SocialLink>}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground transition">About</Link></li>
              <li><Link to="/services" className="hover:text-foreground transition">Services</Link></li>
              <li><Link to="/projects" className="hover:text-foreground transition">Projects</Link></li>
              <li><Link to="/apps" className="hover:text-foreground transition">Apps</Link></li>
              <li><Link to="/blog" className="hover:text-foreground transition">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {profile?.email && <li><a href={`mailto:${profile.email}`} className="hover:text-foreground transition">{profile.email}</a></li>}
              {profile?.phone && <li>{profile.phone}</li>}
              <li><Link to="/contact" className="hover:text-foreground transition">Get in touch →</Link></li>
              <li><Link to="/auth" className="hover:text-foreground transition text-xs opacity-60">Admin</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 text-xs text-muted-foreground flex flex-wrap justify-between gap-4">
          <p>© {new Date().getFullYear()} Good News. All rights reserved.</p>
          <p>Crafted with obsessive attention to detail.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-9 w-9 place-items-center rounded-lg glass hover:bg-primary/10 hover:border-primary/40 transition"
    >
      {children}
    </a>
  );
}

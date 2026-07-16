import { createFileRoute, useServerFn } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SectionHeader } from "@/components/site/sections";
import { submitContact } from "@/lib/public.functions";
import { useState } from "react";
import { Mail, Phone, MapPin, Github, Linkedin, Twitter, Instagram, Send } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — Good News" },
      { name: "description", content: "Get in touch with Good News for your next project." },
      { property: "og:title", content: "Contact Good News" },
      { property: "og:description", content: "Get in touch for your next project." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: ContactPage,
});

function ContactPage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const submit = useServerFn(submitContact);
  const [pending, setPending] = useState(false);
  const social = (profile?.social as Record<string, string>) ?? {};

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const data = {
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      subject: String(f.get("subject") ?? ""),
      message: String(f.get("message") ?? ""),
    };
    setPending(true);
    try {
      await submit({ data });
      toast.success("Message sent! I'll reply within 24 hours.");
      e.currentTarget.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <SiteLayout profile={profile}>
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader eyebrow="Get in Touch" title="Let's Build Something" subtitle="Have a project idea? Fill in the form — I typically reply within 24 hours." />

          <div className="mt-16 grid gap-8 md:grid-cols-5">
            <div className="md:col-span-2 space-y-4">
              {profile?.email && <InfoRow icon={Mail} label="Email" value={profile.email} href={`mailto:${profile.email}`} />}
              {profile?.phone && <InfoRow icon={Phone} label="Phone" value={profile.phone} href={`tel:${profile.phone}`} />}
              {profile?.address && <InfoRow icon={MapPin} label="Location" value={profile.address} />}

              <div className="rounded-2xl bg-gradient-card border border-border/60 p-5">
                <div className="text-sm font-semibold mb-3">Find me elsewhere</div>
                <div className="flex flex-wrap gap-2">
                  {social.github && <SocialBtn href={social.github}><Github className="h-4 w-4" /></SocialBtn>}
                  {social.linkedin && <SocialBtn href={social.linkedin}><Linkedin className="h-4 w-4" /></SocialBtn>}
                  {social.twitter && <SocialBtn href={social.twitter}><Twitter className="h-4 w-4" /></SocialBtn>}
                  {social.instagram && <SocialBtn href={social.instagram}><Instagram className="h-4 w-4" /></SocialBtn>}
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="md:col-span-3 rounded-3xl bg-gradient-card border border-border/60 p-6 md:p-8 shadow-elevated">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" name="name" required maxLength={120} />
                <Field label="Email" name="email" type="email" required maxLength={200} />
                <Field label="Phone (optional)" name="phone" maxLength={40} />
                <Field label="Subject (optional)" name="subject" maxLength={200} />
              </div>
              <div className="mt-4">
                <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Message</label>
                <textarea
                  name="message"
                  required
                  minLength={5}
                  maxLength={4000}
                  rows={6}
                  className="mt-2 w-full rounded-xl bg-input/60 border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition resize-none"
                  placeholder="Tell me about your project…"
                />
              </div>
              <button
                type="submit"
                disabled={pending}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-[1.02] transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? "Sending…" : (<>Send Message <Send className="h-4 w-4" /></>)}
              </button>
            </form>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

function Field({ label, name, type = "text", required, maxLength }: { label: string; name: string; type?: string; required?: boolean; maxLength?: number }) {
  return (
    <div>
      <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        className="mt-2 w-full rounded-xl bg-input/60 border border-border px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
      />
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href?: string }) {
  const body = (
    <>
      <div className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-primary shadow-glow shrink-0">
        <Icon className="h-4 w-4 text-primary-foreground" />
      </div>
      <div>
        <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </>
  );
  const className = "flex items-center gap-3 rounded-2xl bg-gradient-card border border-border/60 p-4 card-hover";
  return href ? <a href={href} className={className}>{body}</a> : <div className={className}>{body}</div>;
}

function SocialBtn({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-lg glass hover:bg-primary/10 hover:border-primary/40 transition">
      {children}
    </a>
  );
}

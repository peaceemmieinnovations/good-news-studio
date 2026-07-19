import { SiteHeader } from "./header";
import { SiteFooter } from "./footer";
import { SmoothScroll, ScrollProgress } from "@/lib/motion";
import type { ProfileRow } from "@/lib/queries";

export function SiteLayout({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile?: ProfileRow | null;
}) {
  return (
    <SmoothScroll>
      <div className="min-h-screen flex flex-col relative">
        <ScrollProgress />
        <SiteHeader />
        <main className="flex-1 pt-24">{children}</main>
        <SiteFooter profile={profile} />
      </div>
    </SmoothScroll>
  );
}

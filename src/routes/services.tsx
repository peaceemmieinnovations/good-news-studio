import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { profileQuery, servicesQuery } from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import { SectionHeader, ServicesSection, CtaSection } from "@/components/site/sections";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Good News" },
      { name: "description", content: "Mobile apps, websites, custom software, UI/UX, and API integration." },
      { property: "og:title", content: "Services — Good News" },
      { property: "og:description", content: "End-to-end product development." },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(servicesQuery),
    ]);
  },
  component: ServicesPage,
});

function ServicesPage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  return (
    <SiteLayout profile={profile}>
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <SectionHeader eyebrow="What I Offer" title="Services" subtitle="Every engagement is scoped clearly, priced fairly, and delivered on time." />
        </div>
      </section>
      <ServicesSection services={services ?? []} />
      <CtaSection />
    </SiteLayout>
  );
}

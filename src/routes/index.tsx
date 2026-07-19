import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  profileQuery, servicesQuery, skillsQuery, featuredProjectsQuery,
  testimonialsQuery, appsQuery, blogPostsQuery,
} from "@/lib/queries";
import { SiteLayout } from "@/components/site/layout";
import {
  Hero, ServicesSection, SkillsSection, ProjectsSection,
  TestimonialsSection, AppsPreview, BlogPreview, CtaSection,
} from "@/components/site/sections";
import { Marquee } from "@/lib/motion";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery),
      context.queryClient.ensureQueryData(servicesQuery),
      context.queryClient.ensureQueryData(skillsQuery),
      context.queryClient.ensureQueryData(featuredProjectsQuery),
      context.queryClient.ensureQueryData(testimonialsQuery),
      context.queryClient.ensureQueryData(appsQuery),
      context.queryClient.ensureQueryData(blogPostsQuery),
    ]);
  },
  component: HomePage,
});

function HomePage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: skills } = useSuspenseQuery(skillsQuery);
  const { data: projects } = useSuspenseQuery(featuredProjectsQuery);
  const { data: testimonials } = useSuspenseQuery(testimonialsQuery);
  const { data: apps } = useSuspenseQuery(appsQuery);
  const { data: posts } = useSuspenseQuery(blogPostsQuery);

  return (
    <SiteLayout profile={profile}>
      <Hero profile={profile} />
      <ServicesSection services={services ?? []} />
      <SkillsSection skills={skills ?? []} />
      <ProjectsSection projects={projects ?? []} />
      <AppsPreview apps={apps ?? []} />
      <TestimonialsSection items={testimonials ?? []} />
      <BlogPreview posts={posts ?? []} />
      <CtaSection />
    </SiteLayout>
  );
}

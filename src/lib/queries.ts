import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ProfileRow = Tables<"profile">;
export type ServiceRow = Tables<"services">;
export type SkillRow = Tables<"skills">;
export type ProjectRow = Tables<"projects">;
export type AppRow = Tables<"apps">;
export type BlogPostRow = Tables<"blog_posts">;
export type TestimonialRow = Tables<"testimonials">;
export type GalleryRow = Tables<"gallery">;
export type MessageRow = Tables<"messages">;

function throwIf(error: unknown) { if (error) throw error; }

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async (): Promise<ProfileRow | null> => {
    const { data, error } = await supabase.from("profile").select("*").limit(1).maybeSingle();
    throwIf(error);
    return data as ProfileRow | null;
  },
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: async (): Promise<ServiceRow[]> => {
    const { data, error } = await supabase.from("services").select("*").order("sort_order");
    throwIf(error);
    return (data ?? []) as ServiceRow[];
  },
});

export const skillsQuery = queryOptions({
  queryKey: ["skills"],
  queryFn: async (): Promise<SkillRow[]> => {
    const { data, error } = await supabase.from("skills").select("*").order("sort_order");
    throwIf(error);
    return (data ?? []) as SkillRow[];
  },
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async (): Promise<ProjectRow[]> => {
    const { data, error } = await supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false });
    throwIf(error);
    return (data ?? []) as ProjectRow[];
  },
});

export const featuredProjectsQuery = queryOptions({
  queryKey: ["projects", "featured"],
  queryFn: async (): Promise<ProjectRow[]> => {
    const { data, error } = await supabase.from("projects").select("*").eq("is_featured", true).order("sort_order");
    throwIf(error);
    return (data ?? []) as ProjectRow[];
  },
});

export const appsQuery = queryOptions({
  queryKey: ["apps"],
  queryFn: async (): Promise<AppRow[]> => {
    const { data, error } = await supabase.from("apps").select("*").order("created_at", { ascending: false });
    throwIf(error);
    return (data ?? []) as AppRow[];
  },
});

export const blogPostsQuery = queryOptions({
  queryKey: ["blog"],
  queryFn: async (): Promise<BlogPostRow[]> => {
    const { data, error } = await supabase.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false });
    throwIf(error);
    return (data ?? []) as BlogPostRow[];
  },
});

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: async (): Promise<TestimonialRow[]> => {
    const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
    throwIf(error);
    return (data ?? []) as TestimonialRow[];
  },
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: async (): Promise<GalleryRow[]> => {
    const { data, error } = await supabase.from("gallery").select("*").order("sort_order");
    throwIf(error);
    return (data ?? []) as GalleryRow[];
  },
});

export function projectBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["projects", slug],
    queryFn: async (): Promise<ProjectRow | null> => {
      const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
      throwIf(error);
      return data as ProjectRow | null;
    },
  });
}

export function appBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["apps", slug],
    queryFn: async (): Promise<AppRow | null> => {
      const { data, error } = await supabase.from("apps").select("*").eq("slug", slug).maybeSingle();
      throwIf(error);
      return data as AppRow | null;
    },
  });
}

export function blogBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["blog", slug],
    queryFn: async (): Promise<BlogPostRow | null> => {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
      throwIf(error);
      return data as BlogPostRow | null;
    },
  });
}

export const messagesQuery = queryOptions({
  queryKey: ["messages"],
  queryFn: async (): Promise<MessageRow[]> => {
    const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
    throwIf(error);
    return (data ?? []) as MessageRow[];
  },
});

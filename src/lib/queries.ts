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

async function unwrap<T>(p: PromiseLike<{ data: T | null; error: unknown }>): Promise<T | null> {
  const { data, error } = (await p) as { data: T | null; error: unknown };
  if (error) throw error;
  return data;
}
async function unwrapList<T>(p: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const { data, error } = (await p) as { data: T[] | null; error: unknown };
  if (error) throw error;
  return data ?? [];
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: () => unwrap(supabase.from("profile").select("*").limit(1).maybeSingle()),
});

export const servicesQuery = queryOptions({
  queryKey: ["services"],
  queryFn: () => unwrap(supabase.from("services").select("*").order("sort_order")),
});

export const skillsQuery = queryOptions({
  queryKey: ["skills"],
  queryFn: () => unwrap(supabase.from("skills").select("*").order("sort_order")),
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: () => unwrap(supabase.from("projects").select("*").order("sort_order").order("created_at", { ascending: false })),
});

export const featuredProjectsQuery = queryOptions({
  queryKey: ["projects", "featured"],
  queryFn: () => unwrap(supabase.from("projects").select("*").eq("is_featured", true).order("sort_order")),
});

export const appsQuery = queryOptions({
  queryKey: ["apps"],
  queryFn: () => unwrap(supabase.from("apps").select("*").order("created_at", { ascending: false })),
});

export const blogPostsQuery = queryOptions({
  queryKey: ["blog"],
  queryFn: () => unwrap(supabase.from("blog_posts").select("*").eq("is_published", true).order("published_at", { ascending: false })),
});

export const testimonialsQuery = queryOptions({
  queryKey: ["testimonials"],
  queryFn: () => unwrap(supabase.from("testimonials").select("*").order("sort_order")),
});

export const galleryQuery = queryOptions({
  queryKey: ["gallery"],
  queryFn: () => unwrap(supabase.from("gallery").select("*").order("sort_order")),
});

export function projectBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["projects", slug],
    queryFn: () => unwrap(supabase.from("projects").select("*").eq("slug", slug).maybeSingle()),
  });
}

export function appBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["apps", slug],
    queryFn: () => unwrap(supabase.from("apps").select("*").eq("slug", slug).maybeSingle()),
  });
}

export function blogBySlugQuery(slug: string) {
  return queryOptions({
    queryKey: ["blog", slug],
    queryFn: () => unwrap(supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle()),
  });
}

export const messagesQuery = queryOptions({
  queryKey: ["messages"],
  queryFn: () => unwrap(supabase.from("messages").select("*").order("created_at", { ascending: false })),
});

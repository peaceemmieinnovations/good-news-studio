import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap[.]xml")({
  server: {
    handlers: {
      GET: async () => {
        const url = process.env.SUPABASE_URL!;
        const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
        const supa = createClient<Database>(url, key, {
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });

        const [projectsRes, appsRes, blogRes] = await Promise.all([
          supa.from("projects").select("slug").eq("is_visible", true),
          supa.from("apps").select("slug").eq("is_visible", true),
          supa.from("blog_posts").select("slug").eq("is_published", true),
        ]);

        const paths = [
          "/", "/about", "/services", "/projects", "/apps", "/blog", "/contact",
          ...(projectsRes.data ?? []).map((p) => `/projects/${p.slug}`),
          ...(appsRes.data ?? []).map((a) => `/apps/${a.slug}`),
          ...(blogRes.data ?? []).map((b) => `/blog/${b.slug}`),
        ];

        const xml =
          `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
          paths.map((p) => `  <url><loc>${BASE_URL}${p}</loc></url>`).join("\n") +
          `\n</urlset>`;
        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});

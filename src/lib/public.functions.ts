import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function isNewKey(v: string) { return v.startsWith("sb_publishable_") || v.startsWith("sb_secret_"); }
function makeFetch(key: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(init?.headers);
    if (isNewKey(key) && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key);
    return fetch(input, { ...init, headers });
  };
}

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(4000),
});

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => contactSchema.parse(data))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supa = createClient<Database>(url, key, {
      global: { fetch: makeFetch(key) },
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    const { error } = await supa.from("messages").insert({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const trackDownload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ app_id: z.string().uuid(), version: z.string().max(40).optional() }).parse(data))
  .handler(async ({ data }) => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supa = createClient<Database>(url, key, {
      global: { fetch: makeFetch(key) },
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });
    await supa.from("app_downloads").insert({ app_id: data.app_id, version: data.version ?? null });
    // increment count via admin (bypass RLS)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("apps").select("download_count").eq("id", data.app_id).maybeSingle();
    if (row) {
      await supabaseAdmin.from("apps").update({ download_count: (row.download_count ?? 0) + 1 }).eq("id", data.app_id);
    }
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin only");
}

export type AIMode =
  | "blog-post"
  | "project-description"
  | "app-description"
  | "service-description"
  | "bio"
  | "seo-meta"
  | "free";

const SYSTEM_PROMPTS: Record<AIMode, string> = {
  "blog-post":
    "You are a senior tech writer. Write engaging, well-structured blog posts in Markdown with clear H2/H3 headings, short paragraphs, and practical insights. Output only the article body — no title or preamble.",
  "project-description":
    "You are a portfolio copywriter. Write concise, compelling project descriptions (80-150 words) that highlight the problem, solution, and impact. Professional tone, active voice.",
  "app-description":
    "You are a mobile app store copywriter. Write a punchy, benefit-focused description (100-200 words) that sells the value to users.",
  "service-description":
    "You are a freelance services copywriter. Write clear, client-facing descriptions (60-120 words) that explain deliverables and value.",
  bio: "You are a personal branding writer. Write a first-person developer bio (2-4 sentences) that sounds confident but human.",
  "seo-meta":
    "You write SEO meta descriptions: 150-160 characters, active voice, includes the primary keyword naturally. Output only the meta description, no quotes.",
  free: "You are a helpful writing assistant for a developer portfolio CMS. Produce clean, publish-ready content in the requested format.",
};

export const aiGenerate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { mode: AIMode; prompt: string; context?: string }) => {
    if (!d.prompt || d.prompt.trim().length < 3) throw new Error("Prompt too short");
    if (d.prompt.length > 4000) throw new Error("Prompt too long");
    if (!SYSTEM_PROMPTS[d.mode]) throw new Error("Invalid mode");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const messages = [
      { role: "system", content: SYSTEM_PROMPTS[data.mode] },
      ...(data.context ? [{ role: "user", content: `Context:\n${data.context}` }] : []),
      { role: "user", content: data.prompt },
    ];

    const res = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Rate limit — please wait a moment and try again.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in Lovable settings.");
      throw new Error(`AI request failed [${res.status}]: ${body}`);
    }

    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!text) throw new Error("Empty AI response");
    return { text };
  });

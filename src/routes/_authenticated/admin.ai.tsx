import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Textarea, Button } from "@/components/admin/ui";
import { aiGenerate, type AIMode } from "@/lib/ai-assistant.functions";
import { Sparkles, Copy, Wand2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/ai")({
  head: () => ({ meta: [{ title: "AI Assistant — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AIAssistantPage,
});

const MODES: { id: AIMode; label: string; hint: string; placeholder: string }[] = [
  { id: "blog-post", label: "Blog Post", hint: "Full Markdown article", placeholder: "e.g. 5 lessons from shipping a React Native app to production" },
  { id: "project-description", label: "Project Description", hint: "Portfolio blurb", placeholder: "e.g. FinTrack — personal finance app with bank sync and budgets" },
  { id: "app-description", label: "App Description", hint: "Store-ready copy", placeholder: "e.g. Meditation app with offline mode and Apple Health integration" },
  { id: "service-description", label: "Service Description", hint: "Client-facing", placeholder: "e.g. Custom Shopify storefronts with headless architecture" },
  { id: "bio", label: "Developer Bio", hint: "Short about-me", placeholder: "e.g. React Native + backend, 6 years, based in Lagos, love clean UX" },
  { id: "seo-meta", label: "SEO Meta", hint: "150-160 chars", placeholder: "e.g. Landing page for a mobile budgeting app" },
  { id: "free", label: "Free-form", hint: "Any prompt", placeholder: "Write anything…" },
];

function AIAssistantPage() {
  const generate = useServerFn(aiGenerate);
  const [mode, setMode] = useState<AIMode>("blog-post");
  const [prompt, setPrompt] = useState("");
  const [context, setContext] = useState("");
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);

  const active = MODES.find((m) => m.id === mode)!;

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setOutput("");
    try {
      const { text } = await generate({ data: { mode, prompt, context: context || undefined } });
      setOutput(text);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to generate");
    } finally {
      setBusy(false);
    }
  }

  async function copyOut() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard");
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="AI Assistant"
        description="Draft blog posts, descriptions, bios, and SEO copy in seconds."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <form onSubmit={onGenerate} className="space-y-5">
            <Field label="Task">
              <div className="grid grid-cols-2 gap-2">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      mode === m.id
                        ? "border-primary bg-primary/10 text-foreground shadow-glow"
                        : "border-border bg-input/40 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="font-medium">{m.label}</div>
                    <div className="text-xs text-muted-foreground">{m.hint}</div>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Prompt" hint={active.hint}>
              <Input
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={active.placeholder}
              />
            </Field>

            <Field label="Extra context (optional)" hint="Facts, style, keywords, audience">
              <Textarea
                rows={4}
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="e.g. audience: indie developers; tone: friendly, technical; must mention Supabase, RLS, and edge functions."
              />
            </Field>

            <Button type="submit" disabled={busy} className="w-full justify-center">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </form>
        </AdminCard>

        <AdminCard>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Output</h3>
            </div>
            {output && (
              <Button variant="ghost" onClick={copyOut}>
                <Copy className="h-3.5 w-3.5" /> Copy
              </Button>
            )}
          </div>

          {busy ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating with Gemini 2.5 Flash…
            </div>
          ) : output ? (
            <div className="rounded-xl bg-input/40 border border-border p-4 max-h-[600px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-[family-name:var(--font-body)] leading-relaxed">
                {output}
              </pre>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-12 text-center">
              Your generated content will appear here. Paste it into any admin form.
            </div>
          )}
        </AdminCard>
      </div>
    </AdminShell>
  );
}

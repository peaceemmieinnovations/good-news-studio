import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { projectsQuery, type ProjectRow } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Textarea, Button, TagsInput, SlugFromTitle } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Sparkles, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/projects")({
  head: () => ({ meta: [{ title: "Projects — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProjectsAdmin,
});

const empty = (): Partial<ProjectRow> => ({
  title: "", slug: "", description: "", category: "Web",
  technologies: [], images: [], is_featured: false, is_visible: true, sort_order: 0,
});

function ProjectsAdmin() {
  const qc = useQueryClient();
  const { data: projects } = useSuspenseQuery(projectsQuery);
  const [editing, setEditing] = useState<Partial<ProjectRow> | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.title || !editing.slug) { toast.error("Title and slug required"); return; }
    setSaving(true);
    try {
      const payload = {
        title: editing.title, slug: editing.slug,
        description: editing.description ?? null,
        long_description: editing.long_description ?? null,
        category: editing.category ?? "Web",
        cover_url: editing.cover_url ?? null,
        images: editing.images ?? [],
        technologies: editing.technologies ?? [],
        github_url: editing.github_url ?? null,
        live_url: editing.live_url ?? null,
        video_url: editing.video_url ?? null,
        client: editing.client ?? null,
        status: editing.status ?? "Completed",
        is_featured: editing.is_featured ?? false,
        is_visible: editing.is_visible ?? true,
        sort_order: editing.sort_order ?? 0,
      };
      const { error } = editing.id
        ? await supabase.from("projects").update(payload).eq("id", editing.id)
        : await supabase.from("projects").insert(payload);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Saved");
      setEditing(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this project?")) return;
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["projects"] });
    toast.success("Deleted");
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Projects"
        description="Manage the projects shown in your portfolio."
        action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New project</Button>}
      />

      <div className="grid gap-3">
        {projects.map((p) => (
          <AdminCard key={p.id} className="flex items-center gap-4 hover:border-primary/40 transition">
            {p.cover_url ? (
              <img src={p.cover_url} alt="" className="h-16 w-24 rounded-lg object-cover" />
            ) : (
              <div className="h-16 w-24 rounded-lg bg-gradient-primary grid place-items-center font-bold text-primary-foreground">
                {p.title.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold truncate">{p.title}</div>
                {p.is_featured && <Sparkles className="h-3.5 w-3.5 text-accent" />}
                {!p.is_visible && <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
              <div className="text-xs text-muted-foreground truncate">{p.category} · /{p.slug}</div>
            </div>
            <Button variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
            <Button variant="danger" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </AdminCard>
        ))}
        {projects.length === 0 && <div className="text-sm text-muted-foreground">No projects yet.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <AdminCard className="max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing.id ? "Edit project" : "New project"}</h3>
              <Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title">
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || SlugFromTitle(e.target.value) })}
                />
              </Field>
              <Field label="Slug"><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              <Field label="Category">
                <select
                  value={editing.category ?? "Web"}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="w-full rounded-xl bg-input/60 border border-border px-4 py-2.5 text-sm outline-none"
                >
                  {["Web","Mobile","Software","AI","API","Design"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={editing.status ?? "Completed"}
                  onChange={(e) => setEditing({ ...editing, status: e.target.value })}
                  className="w-full rounded-xl bg-input/60 border border-border px-4 py-2.5 text-sm outline-none"
                >
                  {["Completed","In Progress","Concept"].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Cover image URL"><Input value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} placeholder="https://…" /></Field>
              <Field label="GitHub"><Input value={editing.github_url ?? ""} onChange={(e) => setEditing({ ...editing, github_url: e.target.value })} placeholder="https://github.com/…" /></Field>
              <Field label="Live URL"><Input value={editing.live_url ?? ""} onChange={(e) => setEditing({ ...editing, live_url: e.target.value })} placeholder="https://…" /></Field>
              <Field label="Client"><Input value={editing.client ?? ""} onChange={(e) => setEditing({ ...editing, client: e.target.value })} /></Field>
              <div className="sm:col-span-2">
                <Field label="Short description"><Input value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Long description"><Textarea rows={5} value={editing.long_description ?? ""} onChange={(e) => setEditing({ ...editing, long_description: e.target.value })} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Technologies">
                  <TagsInput value={editing.technologies ?? []} onChange={(v) => setEditing({ ...editing, technologies: v })} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Gallery image URLs">
                  <TagsInput value={editing.images ?? []} onChange={(v) => setEditing({ ...editing, images: v })} placeholder="Paste URL and press Enter" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_featured ?? false} onChange={(e) => setEditing({ ...editing, is_featured: e.target.checked })} /> Featured
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_visible ?? true} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} /> Visible on site
              </label>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </AdminCard>
        </div>
      )}
    </AdminShell>
  );
}

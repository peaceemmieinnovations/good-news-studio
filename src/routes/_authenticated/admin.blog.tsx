import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Textarea, Button, TagsInput, SlugFromTitle } from "@/components/admin/ui";
import { FileUpload } from "@/components/admin/file-upload";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff } from "lucide-react";
import type { BlogPostRow } from "@/lib/queries";

const allPostsQuery = {
  queryKey: ["blog", "all"] as const,
  queryFn: async (): Promise<BlogPostRow[]> => {
    const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as BlogPostRow[];
  },
};

export const Route = createFileRoute("/_authenticated/admin/blog")({
  head: () => ({ meta: [{ title: "Blog — Admin" }, { name: "robots", content: "noindex" }] }),
  component: BlogAdmin,
});

const empty = (): Partial<BlogPostRow> => ({
  slug: "", title: "", excerpt: "", content: "", category: "General",
  tags: [], read_minutes: 5, is_published: false,
});

function BlogAdmin() {
  const qc = useQueryClient();
  const { data: posts = [] } = useQuery(allPostsQuery);
  const [editing, setEditing] = useState<Partial<BlogPostRow> | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing?.title || !editing.slug) { toast.error("Title and slug required"); return; }
    setSaving(true);
    try {
      const payload = {
        slug: editing.slug, title: editing.title,
        excerpt: editing.excerpt ?? null,
        content: editing.content ?? null,
        cover_url: editing.cover_url ?? null,
        category: editing.category ?? "General",
        tags: editing.tags ?? [],
        read_minutes: editing.read_minutes ?? 5,
        is_published: editing.is_published ?? false,
        published_at: (editing.is_published && !editing.published_at) ? new Date().toISOString() : editing.published_at ?? null,
      };
      const { error } = editing.id
        ? await supabase.from("blog_posts").update(payload).eq("id", editing.id)
        : await supabase.from("blog_posts").insert(payload);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["blog"] });
      toast.success("Saved");
      setEditing(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this post?")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["blog"] });
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Blog"
        description="Write and publish articles."
        action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New post</Button>}
      />
      <div className="grid gap-3">
        {posts.map((p) => (
          <AdminCard key={p.id} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold truncate">{p.title}</div>
                {p.is_published ? <Eye className="h-3.5 w-3.5 text-accent" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
              <div className="text-xs text-muted-foreground truncate">{p.category} · /{p.slug}</div>
            </div>
            <Button variant="ghost" onClick={() => setEditing(p)}>Edit</Button>
            <Button variant="danger" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4" /></Button>
          </AdminCard>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <AdminCard className="max-w-3xl w-full my-8">
            <h3 className="font-semibold text-lg mb-4">{editing.id ? "Edit post" : "New post"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title"><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || SlugFromTitle(e.target.value) })} /></Field>
              <Field label="Slug"><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              <Field label="Category"><Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
              <Field label="Read time (min)"><Input type="number" value={editing.read_minutes ?? 5} onChange={(e) => setEditing({ ...editing, read_minutes: Number(e.target.value) })} /></Field>
              <div className="sm:col-span-2"><Field label="Cover URL"><Input value={editing.cover_url ?? ""} onChange={(e) => setEditing({ ...editing, cover_url: e.target.value })} placeholder="https://…" /></Field></div>
              <div className="sm:col-span-2"><Field label="Excerpt"><Textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label="Content (Markdown supported)"><Textarea rows={12} value={editing.content ?? ""} onChange={(e) => setEditing({ ...editing, content: e.target.value })} /></Field></div>
              <div className="sm:col-span-2"><Field label="Tags"><TagsInput value={editing.tags ?? []} onChange={(v) => setEditing({ ...editing, tags: v })} /></Field></div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_published ?? false} onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })} /> Published
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

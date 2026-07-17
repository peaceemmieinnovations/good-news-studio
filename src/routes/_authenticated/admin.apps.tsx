import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { appsQuery, type AppRow } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Textarea, Button, TagsInput, SlugFromTitle } from "@/components/admin/ui";
import { FileUpload, MultiImageUpload } from "@/components/admin/file-upload";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/apps")({
  head: () => ({ meta: [{ title: "Apps — Admin" }, { name: "robots", content: "noindex" }] }),
  component: AppsAdmin,
});

const empty = (): Partial<AppRow> => ({
  name: "", slug: "", version: "1.0.0", is_visible: true,
  features: [], screenshots: [], download_count: 0, requirements: "Android 6.0+",
});

function AppsAdmin() {
  const qc = useQueryClient();
  const { data: apps } = useSuspenseQuery(appsQuery);
  const [editing, setEditing] = useState<Partial<AppRow> | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing) return;
    if (!editing.name || !editing.slug) { toast.error("Name and slug required"); return; }
    setSaving(true);
    try {
      const payload = {
        name: editing.name, slug: editing.slug,
        tagline: editing.tagline ?? null,
        description: editing.description ?? null,
        logo_url: editing.logo_url ?? null,
        banner_url: editing.banner_url ?? null,
        version: editing.version ?? "1.0.0",
        apk_url: editing.apk_url ?? null,
        apk_size_bytes: editing.apk_size_bytes ?? null,
        release_notes: editing.release_notes ?? null,
        screenshots: editing.screenshots ?? [],
        features: editing.features ?? [],
        requirements: editing.requirements ?? "Android 6.0+",
        play_store_url: editing.play_store_url ?? null,
        website_url: editing.website_url ?? null,
        is_visible: editing.is_visible ?? true,
        released_at: editing.released_at ?? new Date().toISOString(),
      };
      let error;
      if (editing.id) {
        ({ error } = await supabase.from("apps").update(payload).eq("id", editing.id));
      } else {
        ({ error } = await supabase.from("apps").insert(payload));
      }
      if (error) throw error;
      // Record a version entry if there's an APK
      if (editing.id && editing.apk_url) {
        await supabase.from("app_versions").insert({
          app_id: editing.id,
          version: payload.version,
          apk_url: editing.apk_url,
          apk_size_bytes: payload.apk_size_bytes,
          release_notes: payload.release_notes,
        });
      }
      await qc.invalidateQueries({ queryKey: ["apps"] });
      toast.success("Saved");
      setEditing(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Save failed"); }
    finally { setSaving(false); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this app? Version history will also be removed.")) return;
    const { error } = await supabase.from("apps").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["apps"] });
    toast.success("Deleted");
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Apps"
        description="Upload APK URLs and manage the downloads page."
        action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New app</Button>}
      />

      <div className="grid gap-3">
        {apps.map((a) => (
          <AdminCard key={a.id} className="flex items-center gap-4">
            {a.logo_url ? (
              <img src={a.logo_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
            ) : (
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-primary font-bold text-primary-foreground">
                {a.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{a.name}</div>
              <div className="text-xs text-muted-foreground truncate flex items-center gap-3">
                <span>v{a.version}</span>
                <span className="inline-flex items-center gap-1"><Download className="h-3 w-3" /> {a.download_count}</span>
                {a.apk_url ? <span className="text-accent">APK uploaded</span> : <span className="text-destructive">No APK</span>}
              </div>
            </div>
            <Button variant="ghost" onClick={() => setEditing(a)}>Edit</Button>
            <Button variant="danger" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
          </AdminCard>
        ))}
        {apps.length === 0 && <div className="text-sm text-muted-foreground">No apps yet.</div>}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
          <AdminCard className="max-w-3xl w-full my-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editing.id ? "Edit app" : "New app"}</h3>
              <Button variant="ghost" onClick={() => setEditing(null)}>Close</Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || SlugFromTitle(e.target.value) })} /></Field>
              <Field label="Slug"><Input value={editing.slug ?? ""} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></Field>
              <Field label="Tagline"><Input value={editing.tagline ?? ""} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} /></Field>
              <Field label="Version"><Input value={editing.version ?? ""} onChange={(e) => setEditing({ ...editing, version: e.target.value })} /></Field>
              <Field label="Logo URL"><Input value={editing.logo_url ?? ""} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} placeholder="https://…" /></Field>
              <Field label="Banner URL"><Input value={editing.banner_url ?? ""} onChange={(e) => setEditing({ ...editing, banner_url: e.target.value })} placeholder="https://…" /></Field>
              <Field label="APK URL" hint="Direct link to your .apk file (host on GitHub Releases, S3, Cloudinary, etc.)">
                <Input value={editing.apk_url ?? ""} onChange={(e) => setEditing({ ...editing, apk_url: e.target.value })} placeholder="https://…/app.apk" />
              </Field>
              <Field label="APK size (bytes)"><Input type="number" value={editing.apk_size_bytes ?? ""} onChange={(e) => setEditing({ ...editing, apk_size_bytes: Number(e.target.value) })} /></Field>
              <Field label="Play Store URL"><Input value={editing.play_store_url ?? ""} onChange={(e) => setEditing({ ...editing, play_store_url: e.target.value })} placeholder="https://play.google.com/…" /></Field>
              <Field label="Website URL"><Input value={editing.website_url ?? ""} onChange={(e) => setEditing({ ...editing, website_url: e.target.value })} placeholder="https://…" /></Field>
              <Field label="Requirements"><Input value={editing.requirements ?? ""} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} /></Field>
              <div />
              <div className="sm:col-span-2">
                <Field label="Description"><Textarea rows={4} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Release notes"><Textarea rows={3} value={editing.release_notes ?? ""} onChange={(e) => setEditing({ ...editing, release_notes: e.target.value })} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Features"><TagsInput value={editing.features ?? []} onChange={(v) => setEditing({ ...editing, features: v })} /></Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Screenshots URLs"><TagsInput value={editing.screenshots ?? []} onChange={(v) => setEditing({ ...editing, screenshots: v })} /></Field>
              </div>
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

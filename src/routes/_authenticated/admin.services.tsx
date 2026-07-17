import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { servicesQuery, type ServiceRow } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Textarea, Button } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/services")({
  head: () => ({ meta: [{ title: "Services — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ServicesAdmin,
});

const ICONS = ["Smartphone", "Globe", "Code2", "Palette", "Plug", "Database", "Zap"];
const empty = (): Partial<ServiceRow> => ({ title: "", description: "", icon: "Zap", is_visible: true, sort_order: 0 });

function ServicesAdmin() {
  const qc = useQueryClient();
  const { data: services } = useSuspenseQuery(servicesQuery);
  const [editing, setEditing] = useState<Partial<ServiceRow> | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!editing || !editing.title) return;
    setSaving(true);
    try {
      const payload = {
        title: editing.title,
        description: editing.description ?? null,
        icon: editing.icon ?? "Zap",
        price: editing.price ?? null,
        duration: editing.duration ?? null,
        is_visible: editing.is_visible ?? true,
        sort_order: editing.sort_order ?? 0,
      };
      const { error } = editing.id
        ? await supabase.from("services").update(payload).eq("id", editing.id)
        : await supabase.from("services").insert(payload);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Saved");
      setEditing(null);
    } catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
    finally { setSaving(false); }
  }
  async function remove(id: string) {
    if (!confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["services"] });
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Services"
        description="What you offer to clients."
        action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New service</Button>}
      />
      <div className="grid gap-3">
        {services.map((s) => (
          <AdminCard key={s.id} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{s.title}</div>
              <div className="text-xs text-muted-foreground line-clamp-1">{s.description}</div>
              {s.price && <div className="text-xs text-gradient mt-1">{s.price}</div>}
            </div>
            <Button variant="ghost" onClick={() => setEditing(s)}>Edit</Button>
            <Button variant="danger" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
          </AdminCard>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
          <AdminCard className="max-w-2xl w-full">
            <h3 className="font-semibold text-lg mb-4">{editing.id ? "Edit service" : "New service"}</h3>
            <div className="space-y-4">
              <Field label="Title"><Input value={editing.title ?? ""} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></Field>
              <Field label="Description"><Textarea rows={3} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></Field>
              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Icon">
                  <select value={editing.icon ?? "Zap"} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} className="w-full rounded-xl bg-input/60 border border-border px-4 py-2.5 text-sm">
                    {ICONS.map((i) => <option key={i}>{i}</option>)}
                  </select>
                </Field>
                <Field label="Price"><Input value={editing.price ?? ""} onChange={(e) => setEditing({ ...editing, price: e.target.value })} placeholder="From $X" /></Field>
                <Field label="Sort"><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.is_visible ?? true} onChange={(e) => setEditing({ ...editing, is_visible: e.target.checked })} /> Visible
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

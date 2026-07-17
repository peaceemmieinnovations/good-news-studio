import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { skillsQuery, type SkillRow } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Button } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/skills")({
  head: () => ({ meta: [{ title: "Skills — Admin" }, { name: "robots", content: "noindex" }] }),
  component: SkillsAdmin,
});

const empty = (): Partial<SkillRow> => ({ name: "", percentage: 80, category: "General", sort_order: 0 });

function SkillsAdmin() {
  const qc = useQueryClient();
  const { data: skills } = useSuspenseQuery(skillsQuery);
  const [editing, setEditing] = useState<Partial<SkillRow> | null>(null);

  async function save() {
    if (!editing?.name) return;
    const payload = {
      name: editing.name,
      percentage: Math.max(0, Math.min(100, editing.percentage ?? 80)),
      category: editing.category ?? "General",
      sort_order: editing.sort_order ?? 0,
    };
    const { error } = editing.id
      ? await supabase.from("skills").update(payload).eq("id", editing.id)
      : await supabase.from("skills").insert(payload);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["skills"] });
    toast.success("Saved");
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("skills").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["skills"] });
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Skills"
        description="Tech, tools, and expertise levels."
        action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New skill</Button>}
      />
      <div className="grid gap-3">
        {skills.map((s) => (
          <AdminCard key={s.id} className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.percentage}% · {s.category}</div>
              </div>
              <div className="h-1.5 bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-gradient-primary" style={{ width: `${s.percentage}%` }} />
              </div>
            </div>
            <Button variant="ghost" onClick={() => setEditing(s)}>Edit</Button>
            <Button variant="danger" onClick={() => remove(s.id)}><Trash2 className="h-4 w-4" /></Button>
          </AdminCard>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
          <AdminCard className="max-w-md w-full">
            <h3 className="font-semibold text-lg mb-4">{editing.id ? "Edit skill" : "New skill"}</h3>
            <div className="space-y-4">
              <Field label="Name"><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Category"><Input value={editing.category ?? ""} onChange={(e) => setEditing({ ...editing, category: e.target.value })} /></Field>
              <Field label={`Percentage (${editing.percentage ?? 80}%)`}>
                <input type="range" min={0} max={100} value={editing.percentage ?? 80} onChange={(e) => setEditing({ ...editing, percentage: Number(e.target.value) })} className="w-full accent-[oklch(0.62_0.22_260)]" />
              </Field>
              <Field label="Sort order"><Input type="number" value={editing.sort_order ?? 0} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} /></Field>
            </div>
            <div className="mt-6 flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              <Button onClick={save}>Save</Button>
            </div>
          </AdminCard>
        </div>
      )}
    </AdminShell>
  );
}

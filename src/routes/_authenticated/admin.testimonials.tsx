import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { testimonialsQuery, type TestimonialRow } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Textarea, Button } from "@/components/admin/ui";
import { FileUpload } from "@/components/admin/file-upload";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Star } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/testimonials")({
  head: () => ({ meta: [{ title: "Testimonials — Admin" }, { name: "robots", content: "noindex" }] }),
  component: TestimonialsAdmin,
});

const empty = (): Partial<TestimonialRow> => ({ name: "", message: "", rating: 5, is_approved: true, sort_order: 0 });

function TestimonialsAdmin() {
  const qc = useQueryClient();
  const { data: items } = useSuspenseQuery(testimonialsQuery);
  const [editing, setEditing] = useState<Partial<TestimonialRow> | null>(null);

  async function save() {
    if (!editing?.name || !editing.message) return;
    const payload = {
      name: editing.name,
      role: editing.role ?? null,
      company: editing.company ?? null,
      country: editing.country ?? null,
      photo_url: editing.photo_url ?? null,
      message: editing.message,
      rating: editing.rating ?? 5,
      is_approved: editing.is_approved ?? true,
      sort_order: editing.sort_order ?? 0,
    };
    const { error } = editing.id
      ? await supabase.from("testimonials").update(payload).eq("id", editing.id)
      : await supabase.from("testimonials").insert(payload);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["testimonials"] });
    toast.success("Saved");
    setEditing(null);
  }
  async function remove(id: string) {
    if (!confirm("Delete?")) return;
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["testimonials"] });
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Testimonials"
        description="Client reviews shown on your site."
        action={<Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4" /> New</Button>}
      />
      <div className="grid gap-3">
        {items.map((t) => (
          <AdminCard key={t.id} className="flex items-start gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="font-semibold">{t.name}</div>
                <div className="flex">
                  {Array.from({ length: t.rating ?? 5 }).map((_, i) => <Star key={i} className="h-3 w-3 fill-accent text-accent" />)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{[t.role, t.company, t.country].filter(Boolean).join(" · ")}</div>
              <p className="mt-2 text-sm line-clamp-2">{t.message}</p>
            </div>
            <Button variant="ghost" onClick={() => setEditing(t)}>Edit</Button>
            <Button variant="danger" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4" /></Button>
          </AdminCard>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4">
          <AdminCard className="max-w-xl w-full">
            <h3 className="font-semibold text-lg mb-4">{editing.id ? "Edit testimonial" : "New testimonial"}</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Name"><Input value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="Role"><Input value={editing.role ?? ""} onChange={(e) => setEditing({ ...editing, role: e.target.value })} /></Field>
              <Field label="Company"><Input value={editing.company ?? ""} onChange={(e) => setEditing({ ...editing, company: e.target.value })} /></Field>
              <Field label="Country"><Input value={editing.country ?? ""} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></Field>
              <Field label="Photo"><FileUpload value={editing.photo_url} onChange={(u) => setEditing({ ...editing, photo_url: u })} folder="testimonials" /></Field>
              <Field label="Rating (1-5)"><Input type="number" min={1} max={5} value={editing.rating ?? 5} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></Field>
              <div className="sm:col-span-2"><Field label="Message"><Textarea rows={4} value={editing.message ?? ""} onChange={(e) => setEditing({ ...editing, message: e.target.value })} /></Field></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.is_approved ?? true} onChange={(e) => setEditing({ ...editing, is_approved: e.target.checked })} /> Approved</label>
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

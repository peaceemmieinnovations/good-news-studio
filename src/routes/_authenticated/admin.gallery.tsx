import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { galleryQuery, type GalleryRow } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Button } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/gallery")({
  head: () => ({ meta: [{ title: "Gallery — Admin" }, { name: "robots", content: "noindex" }] }),
  component: GalleryAdmin,
});

function GalleryAdmin() {
  const qc = useQueryClient();
  const { data: items } = useSuspenseQuery(galleryQuery);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");

  async function add() {
    if (!url) return toast.error("Image URL required");
    const { error } = await supabase.from("gallery").insert({ image_url: url, title: title || null, category });
    if (error) return toast.error(error.message);
    setUrl(""); setTitle("");
    await qc.invalidateQueries({ queryKey: ["gallery"] });
    toast.success("Added");
  }
  async function remove(id: string) {
    const { error } = await supabase.from("gallery").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  return (
    <AdminShell>
      <AdminPageHeader title="Gallery" description="Visual portfolio images." />
      <AdminCard className="mb-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2"><Field label="Image URL"><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" /></Field></div>
          <Field label="Title (optional)"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Category"><Input value={category} onChange={(e) => setCategory(e.target.value)} /></Field>
        </div>
        <Button onClick={add} className="mt-4"><Plus className="h-4 w-4" /> Add image</Button>
      </AdminCard>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((g) => (
          <div key={g.id} className="relative group rounded-xl overflow-hidden border border-border/60">
            <img src={g.image_url} alt="" className="w-full aspect-square object-cover" />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition p-3 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold">{g.title}</div>
                <div className="text-xs text-muted-foreground">{g.category}</div>
              </div>
              <Button variant="danger" onClick={() => remove(g.id)} className="self-end"><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground col-span-full">No images yet.</div>}
      </div>
    </AdminShell>
  );
}

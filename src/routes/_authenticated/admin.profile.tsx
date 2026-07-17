import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { profileQuery, type ProfileRow } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Textarea, Button } from "@/components/admin/ui";
import { FileUpload } from "@/components/admin/file-upload";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/profile")({
  head: () => ({ meta: [{ title: "Profile — Admin" }, { name: "robots", content: "noindex" }] }),
  component: ProfileAdmin,
});

function ProfileAdmin() {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(profileQuery);
  const [form, setForm] = useState<Partial<ProfileRow>>(data ?? {});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(data ?? {}); }, [data]);
  const social = (form.social as Record<string, string> | null) ?? {};
  const setSocial = (k: string, v: string) => setForm({ ...form, social: { ...social, [k]: v } });
  const set = <K extends keyof ProfileRow>(k: K, v: ProfileRow[K]) => setForm({ ...form, [k]: v });

  async function save() {
    setSaving(true);
    try {
      const payload = {
        name: form.name ?? "Good News",
        title: form.title ?? null,
        tagline: form.tagline ?? null,
        bio: form.bio ?? null,
        mission: form.mission ?? null,
        vision: form.vision ?? null,
        photo_url: form.photo_url ?? null,
        cover_url: form.cover_url ?? null,
        email: form.email ?? null,
        phone: form.phone ?? null,
        whatsapp: form.whatsapp ?? null,
        address: form.address ?? null,
        cv_url: form.cv_url ?? null,
        years_experience: Number(form.years_experience ?? 0),
        projects_completed: Number(form.projects_completed ?? 0),
        happy_clients: Number(form.happy_clients ?? 0),
        social: form.social ?? {},
      };
      const { error } = data?.id
        ? await supabase.from("profile").update(payload).eq("id", data.id)
        : await supabase.from("profile").insert(payload);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally { setSaving(false); }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Profile"
        description="Edit the information shown across the site."
        action={<Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <AdminCard>
          <h3 className="font-semibold mb-4">Basics</h3>
          <div className="space-y-4">
            <Field label="Name"><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Title"><Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} /></Field>
            <Field label="Tagline"><Input value={form.tagline ?? ""} onChange={(e) => set("tagline", e.target.value)} /></Field>
            <Field label="Bio"><Textarea rows={5} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} /></Field>
            <Field label="Mission"><Textarea rows={3} value={form.mission ?? ""} onChange={(e) => set("mission", e.target.value)} /></Field>
            <Field label="Vision"><Textarea rows={3} value={form.vision ?? ""} onChange={(e) => set("vision", e.target.value)} /></Field>
          </div>
        </AdminCard>

        <div className="space-y-6">
          <AdminCard>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-4">
              <Field label="Email"><Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
              <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></Field>
              <Field label="WhatsApp"><Input value={form.whatsapp ?? ""} onChange={(e) => set("whatsapp", e.target.value)} /></Field>
              <Field label="Address"><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></Field>
              <Field label="CV / Resume file"><FileUpload value={form.cv_url} onChange={(u) => set("cv_url", u)} accept=".pdf,application/pdf" folder="cv" preview="file" label="Upload CV (PDF)" /></Field>
              <Field label="Profile photo"><FileUpload value={form.photo_url} onChange={(u) => set("photo_url", u)} folder="profile" /></Field>
              <Field label="Cover image"><FileUpload value={form.cover_url} onChange={(u) => set("cover_url", u)} folder="profile" /></Field>
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="font-semibold mb-4">Social Links</h3>
            <div className="space-y-4">
              {["github","linkedin","twitter","instagram","facebook","youtube","telegram"].map((k) => (
                <Field key={k} label={k.charAt(0).toUpperCase() + k.slice(1)}>
                  <Input value={social[k] ?? ""} onChange={(e) => setSocial(k, e.target.value)} placeholder="https://…" />
                </Field>
              ))}
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="font-semibold mb-4">Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Years Exp"><Input type="number" value={form.years_experience ?? 0} onChange={(e) => set("years_experience", Number(e.target.value))} /></Field>
              <Field label="Projects"><Input type="number" value={form.projects_completed ?? 0} onChange={(e) => set("projects_completed", Number(e.target.value))} /></Field>
              <Field label="Clients"><Input type="number" value={form.happy_clients ?? 0} onChange={(e) => set("happy_clients", Number(e.target.value))} /></Field>
            </div>
          </AdminCard>
        </div>
      </div>
    </AdminShell>
  );
}

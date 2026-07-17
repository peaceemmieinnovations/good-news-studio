import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, X, Loader2, ImageIcon, FileArchive } from "lucide-react";
import { cn } from "@/lib/utils";

const BUCKET = "media";
// 100 years — effectively permanent for portfolio assets.
const SIGN_TTL = 60 * 60 * 24 * 365 * 100;

function randName(file: File) {
  const ext = file.name.split(".").pop() || "bin";
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

async function uploadOne(file: File, folder: string): Promise<string> {
  const path = `${folder}/${randName(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: sErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGN_TTL);
  if (sErr || !data?.signedUrl) throw sErr ?? new Error("Failed to sign URL");
  return data.signedUrl;
}

export function FileUpload({
  value,
  onChange,
  accept = "image/*",
  folder = "images",
  label = "Upload file",
  preview = "image",
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
  folder?: string;
  label?: string;
  preview?: "image" | "file";
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const url = await uploadOne(file, folder);
      onChange(url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {preview === "image" && value ? (
          <img src={value} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
        ) : preview === "image" ? (
          <div className="h-16 w-16 rounded-lg border border-dashed border-border grid place-items-center text-muted-foreground">
            <ImageIcon className="h-5 w-5" />
          </div>
        ) : value ? (
          <div className="flex items-center gap-2 text-xs text-accent">
            <FileArchive className="h-4 w-4" /> File uploaded
          </div>
        ) : null}
        <div className="flex-1 min-w-0">
          <input ref={ref} type="file" accept={accept} onChange={handle} className="hidden" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => ref.current?.click()}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-surface hover:bg-surface/70 px-3 py-2 text-xs font-medium disabled:opacity-60"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {busy ? "Uploading…" : label}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="inline-flex items-center gap-1 rounded-lg bg-destructive/15 text-destructive hover:bg-destructive/25 px-3 py-2 text-xs font-medium"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            )}
          </div>
          {value && (
            <input
              readOnly
              value={value}
              onFocus={(e) => e.currentTarget.select()}
              className="mt-2 w-full rounded-lg bg-input/40 border border-border px-3 py-1.5 text-[10px] text-muted-foreground"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function MultiImageUpload({
  value,
  onChange,
  folder = "gallery",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  folder?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of files) urls.push(await uploadOne(f, folder));
      onChange([...value, ...urls]);
      toast.success(`${urls.length} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {value.map((url, i) => (
          <div key={url + i} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className={cn(
                "absolute top-1 right-1 grid place-items-center h-6 w-6 rounded-full",
                "bg-black/70 text-white opacity-0 group-hover:opacity-100 transition hover:bg-destructive"
              )}
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={busy}
          className="aspect-square rounded-lg border border-dashed border-border grid place-items-center text-muted-foreground hover:border-primary hover:text-primary transition disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
        </button>
      </div>
      <input ref={ref} type="file" accept="image/*" multiple onChange={handle} className="hidden" />
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function AdminCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-gradient-card border border-border/60 p-6", className)}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">{label}</div>
      {children}
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl bg-input/60 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition",
        props.className
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl bg-input/60 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition resize-none",
        props.className
      )}
    />
  );
}

export function Button({ variant = "primary", className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed",
        variant === "primary" && "bg-gradient-primary text-primary-foreground shadow-glow hover:shadow-glow-lg hover:scale-[1.02]",
        variant === "ghost" && "glass hover:bg-surface",
        variant === "danger" && "bg-destructive/15 text-destructive hover:bg-destructive/25",
        className
      )}
    />
  );
}

export function SlugFromTitle(title: string) {
  return title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function add() {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  }
  return (
    <div className="rounded-xl bg-input/60 border border-border p-2 flex flex-wrap gap-1.5">
      {value.map((v) => (
        <span key={v} className="inline-flex items-center gap-1 rounded-lg bg-surface px-2 py-1 text-xs">
          {v}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} className="text-muted-foreground hover:text-destructive">×</button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={placeholder ?? "Add and press Enter"}
        className="flex-1 min-w-32 bg-transparent px-2 py-1 text-sm outline-none"
      />
    </div>
  );
}

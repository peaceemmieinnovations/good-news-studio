import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { Code2 } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In — Admin" },
      { name: "description", content: "Admin sign in for Good News portfolio." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("Account created. You're the first admin!");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Auth failed");
    } finally { setPending(false); }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/admin",
    });
    if (result.error) toast.error(result.error.message);
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 inline-flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary shadow-glow">
            <Code2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-[family-name:var(--font-display)] font-bold text-xl">Good News</span>
        </Link>

        <div className="rounded-3xl glass-strong shadow-elevated p-8">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
            {mode === "signin" ? "Admin sign in" : "Create admin account"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Access the CMS dashboard." : "The first account becomes the admin."}
          </p>

          <button
            type="button"
            onClick={google}
            className="mt-6 w-full rounded-xl glass hover:bg-surface py-2.5 text-sm font-medium transition inline-flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 48 48" className="h-4 w-4">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.3l6.7-6.7C35.7 2 30.1 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-2.7-.3-4H24v7.5h12.4c-.5 3-2.6 6-5.5 7.7l7.8 6c4.6-4.3 7.4-10.6 7.4-17.2z"/>
              <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3.1-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C1 16.1 0 20 0 24s1 7.9 2.6 10.8l7.9-6.1z"/>
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.4-4.8 2.2-8.1 2.2-6.2 0-11.5-4.2-13.4-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/>
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-input/60 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl bg-input/60 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
            />
            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-xl bg-gradient-primary text-primary-foreground shadow-glow py-2.5 text-sm font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {pending ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition"
          >
            {mode === "signin" ? "Need an account? Sign up →" : "Have an account? Sign in →"}
          </button>
        </div>
      </div>
    </div>
  );
}

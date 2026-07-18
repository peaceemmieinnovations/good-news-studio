import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Field, Input, Button } from "@/components/admin/ui";
import {
  listUsers, createUser, setUserRole, resetUserPassword, deleteUser,
} from "@/lib/admin-users.functions";
import { UserPlus, Shield, KeyRound, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({ meta: [{ title: "Users — Admin" }, { name: "robots", content: "noindex" }] }),
  component: UsersAdmin,
});

function UsersAdmin() {
  const qc = useQueryClient();
  const listFn = useServerFn(listUsers);
  const createFn = useServerFn(createUser);
  const setRoleFn = useServerFn(setUserRole);
  const resetFn = useServerFn(resetUserPassword);
  const deleteFn = useServerFn(deleteUser);

  const [me, setMe] = useState<string>("");
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? ""));
  }, []);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => listFn(),
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");
  const [busy, setBusy] = useState(false);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await createFn({ data: { email, password, role } });
      toast.success(`Created ${email}`);
      setEmail(""); setPassword(""); setRole("user");
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create user");
    } finally {
      setBusy(false);
    }
  }

  async function onSetRole(userId: string, next: "admin" | "user") {
    try {
      await setRoleFn({ data: { userId, role: next } });
      toast.success("Role updated");
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    }
  }

  async function onReset(userId: string, email: string) {
    const pw = prompt(`New password for ${email} (min 8 chars):`);
    if (!pw) return;
    try {
      await resetFn({ data: { userId, password: pw } });
      toast.success("Password reset");
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    }
  }

  async function onDelete(userId: string, email: string) {
    if (!confirm(`Delete ${email}? This cannot be undone.`)) return;
    try {
      await deleteFn({ data: { userId } });
      toast.success("User deleted");
      await qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err: any) {
      toast.error(err?.message ?? "Failed");
    }
  }

  return (
    <AdminShell>
      <AdminPageHeader
        title="Users & Access"
        description="Create accounts, assign roles, reset passwords."
      />

      <AdminCard className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus className="h-4 w-4 text-primary" />
          <h3 className="font-semibold">Create new user</h3>
        </div>
        <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-4">
          <Field label="Email">
            <Input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </Field>
          <Field label="Password" hint="Min 8 characters">
            <Input
              type="text" required minLength={8} value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Temporary password"
            />
          </Field>
          <Field label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "user")}
              className="w-full rounded-xl bg-input/60 border border-border px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
            >
              <option value="user">User</option>
              <option value="admin">Admin (full CMS access)</option>
            </select>
          </Field>
          <div className="flex items-end">
            <Button type="submit" disabled={busy} className="w-full justify-center">
              {busy ? "Creating…" : "Create user"}
            </Button>
          </div>
        </form>
      </AdminCard>

      <AdminCard>
        <h3 className="font-semibold mb-4">All users ({users.length})</h3>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-widest text-muted-foreground border-b border-border/60">
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Last sign-in</th>
                  <th className="py-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isAdmin = u.roles.includes("admin");
                  const isMe = u.id === me;
                  return (
                    <tr key={u.id} className="border-b border-border/40 last:border-0">
                      <td className="py-3 pr-4">
                        <div className="font-medium">{u.email}</div>
                        {isMe && <div className="text-xs text-muted-foreground">(you)</div>}
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isAdmin ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {isAdmin && <Shield className="h-3 w-3" />}
                          {isAdmin ? "Admin" : "User"}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground text-xs">
                        {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleString() : "Never"}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2 justify-end flex-wrap">
                          {!isMe && (
                            <Button
                              variant="ghost"
                              onClick={() => onSetRole(u.id, isAdmin ? "user" : "admin")}
                            >
                              <Shield className="h-3.5 w-3.5" />
                              {isAdmin ? "Revoke admin" : "Make admin"}
                            </Button>
                          )}
                          <Button variant="ghost" onClick={() => onReset(u.id, u.email)}>
                            <KeyRound className="h-3.5 w-3.5" /> Reset password
                          </Button>
                          {!isMe && (
                            <Button variant="danger" onClick={() => onDelete(u.id, u.email)}>
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </AdminShell>
  );
}

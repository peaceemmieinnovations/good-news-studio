import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { messagesQuery } from "@/lib/queries";
import { AdminShell } from "@/components/admin/shell";
import { AdminPageHeader, AdminCard, Button } from "@/components/admin/ui";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Mail, Trash2, Reply } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  head: () => ({ meta: [{ title: "Messages — Admin" }, { name: "robots", content: "noindex" }] }),
  component: MessagesAdmin,
});

function MessagesAdmin() {
  const qc = useQueryClient();
  const { data: items } = useSuspenseQuery(messagesQuery);
  const [openId, setOpenId] = useState<string | null>(null);

  async function markRead(id: string) {
    await supabase.from("messages").update({ is_read: true }).eq("id", id);
    await qc.invalidateQueries({ queryKey: ["messages"] });
  }
  async function remove(id: string) {
    if (!confirm("Delete message?")) return;
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await qc.invalidateQueries({ queryKey: ["messages"] });
  }

  return (
    <AdminShell>
      <AdminPageHeader title="Messages" description={`${items.filter((m) => !m.is_read).length} unread`} />
      <div className="grid gap-3">
        {items.map((m) => {
          const open = openId === m.id;
          return (
            <AdminCard key={m.id} className={m.is_read ? "" : "border-primary/40"}>
              <div className="flex items-start gap-4 cursor-pointer" onClick={() => { setOpenId(open ? null : m.id); if (!m.is_read) markRead(m.id); }}>
                <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-primary text-primary-foreground font-semibold">
                  {m.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold truncate">{m.name} <span className="text-xs text-muted-foreground font-normal">· {m.email}</span></div>
                    <div className="text-xs text-muted-foreground shrink-0">{new Date(m.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-muted-foreground truncate">{m.subject || m.message}</div>
                </div>
                {!m.is_read && <span className="h-2 w-2 rounded-full bg-primary mt-4" />}
              </div>
              {open && (
                <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                  {m.phone && <div className="text-sm"><span className="text-muted-foreground">Phone: </span>{m.phone}</div>}
                  {m.subject && <div className="text-sm"><span className="text-muted-foreground">Subject: </span>{m.subject}</div>}
                  <p className="text-sm whitespace-pre-wrap">{m.message}</p>
                  <div className="flex gap-2">
                    <a href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Your message")}`}>
                      <Button variant="primary"><Reply className="h-4 w-4" /> Reply</Button>
                    </a>
                    <Button variant="danger" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4" /> Delete</Button>
                  </div>
                </div>
              )}
            </AdminCard>
          );
        })}
        {items.length === 0 && (
          <AdminCard className="text-center py-16">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-sm text-muted-foreground">No messages yet.</p>
          </AdminCard>
        )}
      </div>
    </AdminShell>
  );
}

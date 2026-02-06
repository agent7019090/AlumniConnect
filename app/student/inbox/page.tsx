"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ConversationItem {
  id: string;
  mentor_id: string;
  mentor_name?: string;
  last_message?: string;
  last_sender_role?: string;
}

import { StudentGuard } from "@/components/guards";

export default function StudentInboxPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  return (
    <StudentGuard>
      <div className="min-h-screen p-6">
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your active conversations</p>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div>Loading...</div>
          ) : conversations.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center">No conversations yet</div>
          ) : (
            conversations.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                <div>
                  <div className="font-medium">{c.mentor_name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{c.last_message}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs">
                    {c.last_sender_role === "student" ? (
                      <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-400">Pending</span>
                    ) : (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-400">Replied</span>
                    )}
                  </div>

                  <Button onClick={() => router.push(`/student/inbox/${c.id}`)} size="sm">Open</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </StudentGuard>
  );

  async function fetchConversations() {
    setLoading(true);
    const { data: convs, error } = await supabase
      .from("conversations")
      .select("id, mentor_id")
      .eq("student_id", user!.id)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const items: ConversationItem[] = [];

    for (const c of convs || []) {
      const { data: mentor } = await supabase.from("profiles").select("full_name, name").eq("id", c.mentor_id).single();
      const { data: last } = await supabase
        .from("messages")
        .select("content, sender_role")
        .eq("conversation_id", c.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      items.push({
        id: c.id,
        mentor_id: c.mentor_id,
        mentor_name: mentor?.name || "Mentor",
        last_message: last?.content || "",
        last_sender_role: last?.sender_role || undefined,
      });
    }

    setConversations(items);
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your active conversations</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div>Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <div className="font-medium">{c.mentor_name}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.last_message}</div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs">
                  {c.last_sender_role === "student" ? (
                    <span className="rounded-full bg-amber-500/10 px-2 py-1 text-amber-400">Pending</span>
                  ) : (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-emerald-400">Replied</span>
                  )}
                </div>

                <Button onClick={() => router.push(`/student/inbox/${c.id}`)} size="sm">Open</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
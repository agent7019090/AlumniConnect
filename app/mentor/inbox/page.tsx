"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function MentorInboxPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchConversations() {
    setLoading(true);
    const { data: convs, error } = await supabase.from("conversations").select("id, student_id, updated_at").eq("mentor_id", user!.id).order("updated_at", { ascending: false });
    setLoading(false);

    if (error) {
      console.error(error);
      return;
    }

    const items: any[] = [];
    for (const c of convs || []) {
      const { data: student } = await supabase.from("profiles").select("name").eq("id", c.student_id).single();
      const { data: last } = await supabase.from("messages").select("content, sender_role").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).single();
      items.push({ id: c.id, studentName: student?.name || "Student", lastMessage: last?.content || "" });
    }

    setConversations(items);
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Inbox</h1>
      <p className="mt-1 text-sm text-muted-foreground">Student messages</p>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div>Loading...</div>
        ) : conversations.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6">No conversations yet</div>
        ) : (
          conversations.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div>
                <div className="font-medium">{c.studentName}</div>
                <div className="mt-1 text-sm text-muted-foreground">{c.lastMessage}</div>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={() => router.push(`/mentor/inbox/${c.id}`)} size="sm">Open</Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
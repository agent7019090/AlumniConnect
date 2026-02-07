"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StudentGuard } from "@/components/guards";
import { Loader2 } from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  sender_role: string;
  content: string;
  created_at: string;
}

export default function ConversationPage() {
  const params = useParams();
  const conversationId = React.useMemo(() => params?.conversationId as string | undefined, [params]);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  // StudentGuard will handle redirects. No manual redirect to avoid premature navigation.

  useEffect(() => {
    if (!conversationId) return;
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  async function fetchMessages() {
  setLoading(true);
  try {
    if (!conversationId) {
      console.error("fetchMessages: missing conversationId");
      setMessages([]);
      return;
    }

    const { data, error } = await supabase
      .from("messages")
      .select("id, sender_id, sender_role, content, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    setMessages((data as Message[]) || []);
  } catch (e) {
    console.error("fetchMessages error:", e);
    setMessages([]);
  } finally {
    setLoading(false); // ← THIS is what fixes the stuck state
  }
}


  async function sendMessage() {
    if (!user || !text.trim()) return;
    setSending(true);

    if (!conversationId) {
      console.error("sendMessage: missing conversationId");
      setSending(false);
      return;
    }

    const { error, data } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      sender_role: user.role === "mentor" ? "mentor" : "student",
      content: text.trim(),
    }).select().single();

    if (error) {
      alert(error.message);
      setSending(false);
      return;
    }

    // Update conversation timestamp
    await supabase.from("conversations").update({ updated_at: new Date() }).eq("id", conversationId);

    setText("");
    setSending(false);
    fetchMessages();
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  return (
    <StudentGuard>
      <div className="min-h-screen p-6">
        <div className="max-w-3xl">
          <h2 className="text-lg font-semibold">Conversation</h2>
          <div className="mt-4 space-y-3">
            {loading ? (
              <div>Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-6">No messages yet. Start the conversation.</div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.sender_role === "student" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-lg p-3 ${m.sender_role === "student" ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"}`}>
                      <div className="text-sm">{m.content}</div>
                      <div className="mt-1 text-xs text-white/70">{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} className="flex-1" rows={3} />
            <Button onClick={sendMessage} disabled={sending || !text.trim()}>
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </StudentGuard>
  );
}
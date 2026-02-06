"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import MentorProfileForm from "@/components/mentor-profile-form";
import { MentorGuard } from "@/components/guards";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MentorDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [availability, setAvailability] = useState<boolean>(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) fetchProfileAndConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function fetchProfileAndConversations() {
    const { data, error } = await supabase.from("profiles").select("availability").eq("id", user!.id).single();
    if (!error && data) setAvailability(typeof data.availability === "boolean" ? data.availability : true);

    setLoading(true);
    const { data: convs, error: convErr } = await supabase.from("conversations").select("id, student_id, updated_at").eq("mentor_id", user!.id).order("updated_at", { ascending: false });
    setLoading(false);

    if (convErr) {
      console.error(convErr);
      return;
    }

    // Fetch student names for each conversation
    const items: any[] = [];
    for (const c of convs || []) {
      const { data: student } = await supabase.from("profiles").select("full_name, name").eq("id", c.student_id).single();
      // Fetch last message
      const { data: last } = await supabase.from("messages").select("content, sender_role").eq("conversation_id", c.id).order("created_at", { ascending: false }).limit(1).single();

      items.push({ id: c.id, studentName: (student as any)?.full_name ?? student?.name ?? "Student", lastMessage: last?.content || "", lastSenderRole: last?.sender_role });
    }

    setConversations(items);
  }

  async function toggleAvailability(next: boolean) {
    if (!user?.id) return;
    // Optimistic update
    const prev = availability;
    setAvailability(next);

    // Use upsert to guard against missing profile rows
    const { error } = await supabase.from("profiles").upsert({ id: user.id, availability: next }, { onConflict: "id" });
    if (error) {
      alert(error.message);
      setAvailability(prev);
    }
  }

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  return (
    <MentorGuard>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Mentor Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">See students who messaged you and manage your profile</p>
          </div>

          <div className="mt-6 grid grid-cols-12 gap-6">
            <div className="col-span-4">
              <h3 className="text-lg font-semibold">Mentor Profile</h3>
              <div className="mt-4">
                <MentorProfileForm />
              </div>
            </div>

            <div className="col-span-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Students Who Messaged You</h2>
              </div>

              <div className="mt-4 space-y-3">
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
          </div>
        </div>
      </div>
    </MentorGuard>
  );
}
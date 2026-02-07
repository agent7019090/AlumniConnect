"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { MentorGuard } from "@/components/guards";
import { Loader2, MessageSquare, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MentorDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
  if (!user) return;

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, job_title, current_company, skills, availability")
      .eq("id", user.id)
      .single();

    if (
      error ||
      !data ||
      !data.job_title ||
      !data.skills?.length
    ) {
      router.push("/profile/setup");
      return;
    }

    setProfile(data);
    await fetchProfileAndConversations();
  };

  loadProfile();
}, [user]);


  async function fetchProfileAndConversations() {
  setLoading(true);

  const { data: convs, error: convErr } = await supabase
    .from("conversations")
    .select("id, student_id, updated_at")
    .eq("mentor_id", user!.id)
    .order("updated_at", { ascending: false });

  if (convErr) {
    console.error(convErr);
    setLoading(false);
    return;
  }

  const items: any[] = [];

  for (const c of convs || []) {
    // 🔹 get last message
    const { data: lastArr } = await supabase
      .from("messages")
      .select("content, sender_role")
      .eq("conversation_id", c.id)
      .order("created_at", { ascending: false })
      .limit(1);

    // 🚨 KEY FIX: skip conversations with no messages
    if (!lastArr || lastArr.length === 0) continue;

    const last = lastArr[0];

    const { data: student } = await supabase
      .from("profiles")
      .select("full_name, name")
      .eq("id", c.student_id)
      .single();

    items.push({
      id: c.id,
      studentName:
        student?.full_name ?? student?.name ?? "Student",
      lastMessage: last.content,
      lastSenderRole: last.sender_role,
    });
  }

  setConversations(items);
  setLoading(false);
}



  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;
  if (!profile) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

  return (
    <MentorGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">Alumni Dashboard</h1>
            <p className="mt-2 text-base text-muted-foreground">Manage your mentorship profile and connect with students</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT COLUMN - Alumni Profile */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Name:</strong> {profile?.full_name}</p>
                  <p><strong>Role:</strong> {profile?.job_title}</p>
                  <p><strong>Company:</strong> {profile?.current_company}</p>
                  <p><strong>Skills:</strong> {profile?.skills?.join(", ")}</p>

                  <p className="flex items-center gap-2">
                    <strong>Status:</strong>
                    <span className={profile?.availability ? "text-green-600" : "text-muted-foreground"}>
                      {profile?.availability ? "Available" : "Unavailable"}
                    </span>
                  </p>

                  <Button
                    variant="outline"
                    className="mt-2 w-full"
                    onClick={() => router.push("/profile/setup")}
                  >
                    Edit Profile
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* RIGHT COLUMN - Conversations */}
            <div className="lg:col-span-2 space-y-6">
              {/* Messages Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Student Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground space-y-2">
                      {!profile?.availability ? (
                        <>
                          <p>You’re currently unavailable for mentoring</p>
                          <p className="text-sm">
                            Enable availability to start receiving mentee requests
                          </p>
                        </>
                      ) : (
                        <>
                          <p>No student messages yet</p>
                          <p className="text-sm">
                            Students will be able to message you now that you're available
                          </p>
                        </>
                      )}
                    </div>
                  ) : (

                    <div className="space-y-2">
                      {conversations.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => router.push(`/mentor/inbox/${c.id}`)}
                          className="flex cursor-pointer items-start justify-between rounded-lg border border-border bg-card/50 p-4 hover:bg-card/80 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{c.studentName}</div>
                            <div className="mt-1 text-sm text-muted-foreground truncate">{c.lastMessage || "No messages yet"}</div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/mentor/inbox/${c.id}`);
                          }}>
                            Reply
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MentorGuard>
  );
}


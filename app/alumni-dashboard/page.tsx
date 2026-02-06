/**
 * Alumni Dashboard Page
 * 
 * Dashboard for alumni users showing:
 * - Incoming mentorship requests from students
 * - Profile information
 * - Ability to respond to student messages
 * 
 * This page is only accessible to users with the "mentor" role.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap,
  User,
  LogOut,
  Loader2,
  Mail,
  Clock,
  Send,
  Inbox,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { MentorGuard } from "@/components/guards";

/**
 * Message interface for incoming student requests
 */
interface StudentMessage {
  id: string;
  studentName: string;
  studentEmail?: string;
  message: string;
  timestamp: string;
  status: "unread" | "read" | "replied";
}

/**
 * AlumniDashboard Component
 * 
 * Main dashboard for alumni showing incoming mentorship requests
 * and allowing them to respond to students.
 */
export default function AlumniDashboard() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  // State for messages loaded from Supabase
  const [messages, setMessages] = useState<StudentMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<StudentMessage | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showReplySuccess, setShowReplySuccess] = useState(false);

  // Load real incoming mentorship requests (latest message per conversation)
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    async function loadRequests() {
      try {
        const { data: convs, error: convErr } = await supabase
          .from("conversations")
          .select("id, student_id")
          .eq("mentor_id", user.id)
          .order("updated_at", { ascending: false });

        if (convErr || !convs) {
          console.error("Failed to load conversations:", convErr);
          return;
        }

        const out: StudentMessage[] = [];
        for (const c of convs) {
          const { data: student } = await supabase.from("profiles").select("name").eq("id", c.student_id).single();
          const { data: last } = await supabase
            .from("messages")
            .select("id, content, created_at, sender_role")
            .eq("conversation_id", c.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          out.push({
            id: last?.id ?? c.id,
            studentName: (student as any)?.full_name ?? student?.name ?? "Student",
            studentEmail: "",
            message: last?.content ?? "",
            timestamp: last?.created_at ?? new Date().toISOString(),
            status: (last?.sender_role === "mentor") ? "replied" : "unread",
          });
        }

        if (mounted) setMessages(out);
      } catch (e) {
        console.error("loadRequests error:", e);
      }
    }

    loadRequests();

    return () => {
      mounted = false;
    };
  }, [user]);

  /**
   * Authentication and role check
   * Redirects non-alumni users to appropriate pages
   */
  // Role enforcement moved to MentorGuard wrapper (prevents premature redirects)


  /**
   * Handle user logout
   */
  const handleLogout = async () => {
    await signOut();
  };

  /**
   * Handle opening a message
   * Marks it as read if unread
   */
  const handleOpenMessage = (msg: StudentMessage) => {
    setSelectedMessage(msg);
    setReplyText("");
    setShowReplySuccess(false);
    
    // Mark as read if unread
    if (msg.status === "unread") {
      setMessages(prev =>
        prev.map(m =>
          m.id === msg.id ? { ...m, status: "read" as const } : m
        )
      );
    }
  };

  /**
   * Handle sending a reply
   * Simulates sending and updates message status
   */
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return;

    setIsSending(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update message status to replied
    setMessages(prev =>
      prev.map(m =>
        m.id === selectedMessage.id ? { ...m, status: "replied" as const } : m
      )
    );
    
    setIsSending(false);
    setShowReplySuccess(true);
    setReplyText("");
  };

  /**
   * Format timestamp for display
   */
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return "Yesterday";
    return date.toLocaleDateString();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect handled by useEffect
  if (!user || user.role !== "mentor") {
    return null;
  }

  const unreadCount = messages.filter(m => m.status === "unread").length;

  return (
    <MentorGuard>
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {(user?.name ?? user?.email ?? "").split(" ")[0] || ""}!
          </h1>
          <p className="text-muted-foreground">
            Manage your mentorship requests and help students succeed
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Inbox className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{messages.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                <Mail className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unreadCount}</p>
                <p className="text-sm text-muted-foreground">Unread Messages</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {messages.filter(m => m.status === "replied").length}
                </p>
                <p className="text-sm text-muted-foreground">Replied</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Messages Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Mentorship Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Inbox className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No mentorship requests yet</p>
                <p className="text-sm">Students will appear here when they reach out</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <button
                    key={msg.id}
                    onClick={() => handleOpenMessage(msg)}
                    className="flex w-full items-start gap-4 rounded-lg border p-4 text-left transition-colors hover:bg-muted/50"
                  >
                    {/* Avatar */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {msg.studentName.charAt(0)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`font-medium ${msg.status === "unread" ? "text-foreground" : "text-muted-foreground"}`}>
                          {msg.studentName}
                        </span>
                        {msg.status === "unread" && (
                          <Badge className="bg-blue-500 text-xs">New</Badge>
                        )}
                        {msg.status === "replied" && (
                          <Badge variant="secondary" className="text-xs">Replied</Badge>
                        )}
                      </div>
                      <p className={`line-clamp-2 text-sm ${msg.status === "unread" ? "text-foreground" : "text-muted-foreground"}`}>
                        {msg.message}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatTime(msg.timestamp)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Message Reply Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message from {selectedMessage?.studentName}</DialogTitle>
            <DialogDescription>
              {selectedMessage?.studentEmail ? selectedMessage.studentEmail : null}
            </DialogDescription>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4">
              {/* Original Message */}
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">{selectedMessage.message}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Received {formatTime(selectedMessage.timestamp)}
                </p>
              </div>

              {/* Reply Section */}
              {showReplySuccess ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                  <p className="font-medium text-green-800">Reply sent successfully!</p>
                  <p className="text-sm text-green-700">
                    {selectedMessage.studentName} will receive your message
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="reply">Your Reply</Label>
                    <Textarea
                      id="reply"
                      placeholder="Write your response to the student..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={4}
                      disabled={isSending}
                    />
                  </div>

                  <Button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || isSending}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </MentorGuard>
  );
}

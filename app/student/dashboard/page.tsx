"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Mentor {
  id: string;
  name: string | null;
  role: string | null;
  availability?: boolean | null;
}

const TARGET_ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Engineer",
  "Data Scientist",
  "Product Manager",
];

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(false);

  // Student filter UI
  const [skills, setSkills] = useState("Java");
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [companyFilter, setCompanyFilter] = useState("");

  const computeMatchScore = (mentor: any) => {
    const studentSkills = (skills || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const mentorSkills = (mentor.skills || []).map((s: string) => String(s).toLowerCase());
    const skillOverlap = studentSkills.reduce((acc, s) => acc + (mentorSkills.includes(s) ? 1 : 0), 0);

    const studentCompanies = (companyFilter || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const companyMatch = mentor.company ? studentCompanies.includes(String(mentor.company).toLowerCase()) : false;

    const roleMatch = mentor.title ? String(mentor.title).toLowerCase() === String(targetRole || "").toLowerCase() : (mentor.role ? String(mentor.role).toLowerCase() === String(targetRole || "").toLowerCase() : false);

    const score = skillOverlap * 2 + (companyMatch ? 5 : 0) + (roleMatch ? 3 : 0);
    return score;
  };

  useEffect(() => {
    // Ensure Supabase session exists first, then proceed
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getSession();

      if (!data?.session) {
        // If we've finished loading auth and no session, redirect to login
        if (!isLoading) router.push("/auth/login");
        return;
      }

      // Prevent mentors from using student dashboard
      if (user && user.role && user.role !== "student") {
        if (!isLoading) router.push("/mentor/dashboard");
        return;
      }

      // If auth context hasn't populated user yet, wait until it does
      if (!user?.id) return;

      await fetchMentors();
    }

    init();
    return () => {
      mounted = false;
    };
  }, [user, isLoading, router]);

  async function fetchMentors() {
    if (!user?.id) return;

    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("id, name, role, availability")
        .eq("role", "mentor");

      // If availability column doesn't exist, retry without it
      if (error) {
        const msg = (error as any).message || "";
        if (msg.toLowerCase().includes("availability") || msg.toLowerCase().includes("column") || msg.toLowerCase().includes("could not find")) {
          const res = await supabase.from("profiles").select("id, name, role").eq("role", "mentor");
          data = res.data as any;
          // ignore res.error here and treat mentors as available by default
        } else {
          console.error(error);
          return;
        }
      }

      setMentors((data as Mentor[]) || []);
    } finally {
      setLoading(false);
    }
  }

  async function messageMentor(mentorId: string) {
    if (!user) return;

    // Check mentor availability
    let mentorAvailable = true;
    try {
      const { data: mentor, error } = await supabase.from("profiles").select("availability").eq("id", mentorId).single();
      if (!error && mentor) {
        mentorAvailable = typeof mentor.availability === "boolean" ? mentor.availability : true;
      }
    } catch (e) {
      // If column missing or error, assume available
      mentorAvailable = true;
    }

    if (!mentorAvailable) {
      alert("This mentor is currently unavailable.");
      return;
    }

    // Check for existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .match({ student_id: user.id, mentor_id: mentorId })
      .limit(1)
      .single();

    if (existing && existing.id) {
      router.push(`/student/inbox/${existing.id}`);
      return;
    }

    // Create or reuse conversation (upsert on student_id + mentor_id to avoid duplicates)
    const { data, error } = await supabase.from("conversations").upsert({ student_id: user.id, mentor_id: mentorId, updated_at: new Date() }, { onConflict: "student_id,mentor_id" }).select().single();
    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/student/inbox/${(data as any).id}`);
  }

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-semibold">Find Mentors</h1>
      <p className="mt-1 text-sm text-muted-foreground">Message available mentors to start a conversation</p>

      {/* Filter Controls */}
      <div className="mt-4 mb-6 flex flex-wrap gap-3">
        <input value={skills} onChange={(e) => setSkills(e.target.value)} className="rounded border px-3 py-2" placeholder="Skills (comma-separated)" />
        <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="rounded border px-3 py-2">
          {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <input value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="rounded border px-3 py-2" placeholder="Companies (comma-separated)" />
        <Button onClick={() => {
          // apply client-side scoring on currently loaded mentors
          setMentors(prev => prev.map(m => ({ ...m, matchScore: computeMatchScore(m) })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)));
        }}>Filter</Button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div>Loading mentors...</div>
        ) : mentors.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-6 text-center">No mentors available yet</div>
        ) : (
          mentors.map((m) => {
            const available = typeof m.availability === "boolean" ? m.availability : true;
            return (
              <div key={m.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium">{m.name || "Mentor"}</h3>
                    <p className="text-xs text-muted-foreground">{m.title || m.role}</p>
                    {m.company && <p className="text-xs text-muted-foreground">{m.company}</p>}
                  </div>
                  <div>
                    {available ? (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs text-emerald-400">Available</span>
                    ) : (
                      <span className="rounded-full bg-slate-600/20 px-2 py-1 text-xs text-muted-foreground">Unavailable</span>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    onClick={() => messageMentor(m.id)}
                    disabled={available === false}
                    className="w-full"
                  >
                    {available ? "Message Mentor" : "Currently Unavailable"}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
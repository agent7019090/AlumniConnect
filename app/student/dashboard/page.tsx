"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import MentorCard from "@/components/mentor-card";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/guards";
import { Loader2 } from "lucide-react";

interface Mentor {
  id: string;
  name: string | null;
  role: string | null;
  current_company?: string | null;
  skills?: string[] | null;
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
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [companyFilter, setCompanyFilter] = useState("");

  // Hydrate persisted preferences
  useEffect(() => {
    try {
      const key = `student_prefs_${user?.id ?? 'anon'}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const prefs = JSON.parse(raw);
        if (prefs.skills) setSkills(prefs.skills.join(', '));
        if (prefs.targetRole) setTargetRole(prefs.targetRole);
        if (prefs.targetCompanies) setCompanyFilter(prefs.targetCompanies.join(', '));
      }
    } catch (e) {
      // ignore
    }
  }, [user?.id]);

  async function saveStudentProfile() {
    if (!user) return;
    setLoading(true);
    try {
      const skillsArr = (skills || '').split(',').map(s => s.trim()).filter(Boolean);
      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.name || null,
        skills: skillsArr,
        role: 'student',
        target_role: targetRole || null,
        target_companies: (companyFilter || '').split(',').map(s => s.trim()).filter(Boolean),
        profile_completed: true
      }, { onConflict: 'id' });
      if (error) {
        alert(error.message);
        return;
      }
      // persist preferences client-side
      const key = `student_prefs_${user.id}`;
      const prefs = { skills: skillsArr, targetRole, targetCompanies: (companyFilter || '').split(',').map(s => s.trim()).filter(Boolean) };
      localStorage.setItem(key, JSON.stringify(prefs));
      alert('Profile saved');
    } finally {
      setLoading(false);
    }
  }

  const computeMatchScore = (mentor: any) => {
    const studentSkills = (skills || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const mentorSkills = (mentor.skills || []).map((s: string) => String(s).toLowerCase());
    const skillOverlap = studentSkills.reduce((acc, s) => acc + (mentorSkills.includes(s) ? 1 : 0), 0);

    const studentCompanies = (companyFilter || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const companyMatch = mentor.current_company ? studentCompanies.includes(String(mentor.current_company).toLowerCase()) : false;

    const roleMatch = mentor.role ? String(mentor.role).toLowerCase() === String(targetRole || "").toLowerCase() : false;

    const score = skillOverlap * 2 + (companyMatch ? 5 : 0) + (roleMatch ? 3 : 0);
    return score;
  };

  // We fetch mentors only when the user explicitly clicks "Match with Alumni".
  // This avoids showing results before the student provides input.

  async function fetchMentors() {
    if (!user?.id) return;

    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, name, role, current_company, skills, availability")
        .eq("role", "mentor")
        .eq("availability", true);

      // If availability column doesn't exist, retry without it
      if (error) {
        const msg = (error as any).message || "";
        if (msg.toLowerCase().includes("availability") || msg.toLowerCase().includes("column") || msg.toLowerCase().includes("could not find")) {
          const res = await supabase.from("profiles").select("id, full_name, name, role, current_company, skills").eq("role", "mentor");
          data = res.data as any;
        } else {
          console.error(error);
          return;
        }
      }

      // Normalize mentor fields
      const normalized = (data || []).map((m: any) => ({
        id: m.id,
        name: m.full_name ?? m.name ?? null,
        role: m.role ?? null,
        current_company: m.current_company ?? null,
        skills: Array.isArray(m.skills) ? m.skills : (m.skills ? [m.skills] : []),
        availability: typeof m.availability === "boolean" ? m.availability : true,
      }));

      setMentors(normalized as Mentor[]);
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
    <StudentGuard>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Student Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Match with alumni and start conversations</p>
          </div>

          <div className="mt-6 grid grid-cols-12 gap-6">
            {/* LEFT COLUMN - Student Profile Card */}
            <div className="col-span-4">
              <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
                <h3 className="text-lg font-semibold">Student Profile</h3>

                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium">Student Name</label>
                    <input value={user?.name ?? ""} readOnly className="mt-1 block w-full rounded-md border px-3 py-2 bg-transparent" placeholder="Your name" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Skills</label>
                    <input value={skills} onChange={(e) => setSkills(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" placeholder="e.g. java, sql, react" />
                    <p className="mt-1 text-xs text-muted-foreground">Comma-separated skills used for matching</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Target Role</label>
                    <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2">
                      {TARGET_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Target Companies</label>
                    <input value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" placeholder="e.g. Google, Meta" />
                  </div>

                  <div className="flex items-center gap-3">
                    <Button onClick={async () => {
                      // Fetch mentors from the DB, then apply client-side scoring and sort
                      await fetchMentors();
                      setMentors(prev => prev.map(m => ({ ...m, matchScore: computeMatchScore(m) })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)));
                    }} className="flex-1">Match with Alumni</Button>

                    <Button variant="outline" onClick={() => {
                      setSkills("");
                      setTargetRole(TARGET_ROLES[0]);
                      setCompanyFilter("");
                    }}>Reset</Button>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <Button onClick={saveStudentProfile} disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</Button>
                  </div>

                  <div className="mt-4 rounded-md border border-border bg-secondary p-3">
                    <div className="text-sm font-medium">Match Scoring</div>
                    <ul className="mt-2 text-sm text-muted-foreground space-y-1">
                      <li>Skill overlap: <strong>x2</strong></li>
                      <li>Role alignment: <strong>x3</strong></li>
                      <li>Company match: <strong>x5</strong></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - AI Matched Alumni */}
            <div className="col-span-8">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">AI Matched Alumni</h2>
                <div className="text-sm text-muted-foreground">Showing mentors from database</div>
              </div>

              <div className="mt-4 results-panel">
                {loading ? (
                  <div className="text-center text-white">Loading mentors...</div>
                ) : mentors.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-6 text-center">No mentors available yet</div>
                ) : (
                  <div className="mentor-grid">
                    {mentors.map((m) => (
                      <div key={m.id}>
                        <MentorCard mentor={m} matchScore={computeMatchScore(m)} onMessage={messageMentor} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentGuard>
  );
}
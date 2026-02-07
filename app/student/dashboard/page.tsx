"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import MentorCard from "@/components/mentor-card";
import { useRouter } from "next/navigation";
import { StudentGuard } from "@/components/guards";
import { Loader2, Sparkles } from "lucide-react";

interface Mentor {
  id: string;
  name: string | null;
  role: string | null;
  job_title?: string | null;
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
  const [studentName, setStudentName] = useState(user?.name ?? "");
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState(TARGET_ROLES[0]);
  const [companyFilter, setCompanyFilter] = useState("");
  const [profile, setProfile] = useState<any>(null);


  useEffect(() => {
    if (!profile) return;
    fetchMentors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  useEffect(() => {
  if (!user?.id) return;

  const loadProfile = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, skills, target_role, target_companies")
      .eq("id", user.id)
      .single();

    // No profile → force settings
    if (error || !data) {
      router.push("/profile/setup");
      return;
    }

    // Incomplete profile → force settings
    if (!data.skills?.length || !data.target_role) {
      router.push("/profile/setup");
      return;
    }

    // Hydrate dashboard state
    setProfile(data);
    setSkills(data.skills.join(", "));
    setTargetRole(data.target_role);
    setCompanyFilter((data.target_companies || []).join(", "));
  };

  loadProfile();
}, [user?.id]);


  const computeMatchScore = (mentor: any) => {
  let score = 0;

  // ----- Skill matching (primary signal) -----
  const studentSkills = (skills || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const mentorSkills = (mentor.skills || []).map((s: string) =>
    String(s).toLowerCase()
  );

  const skillMatches = studentSkills.filter(skill =>
    mentorSkills.includes(skill)
  );

  score += skillMatches.length * 30; // 30% per matching skill

  // ----- Company match -----
  const targetCompanies = (companyFilter || "")
    .split(",")
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  if (
    mentor.current_company &&
    targetCompanies.includes(mentor.current_company.toLowerCase())
  ) {
    score += 25;
  }

  // ----- Job title / target role match -----
  if (
    mentor.job_title &&
    mentor.job_title.toLowerCase().includes(targetRole.toLowerCase())
  ) {
    score += 15;
  }

  return Math.min(score, 100); // cap at 100%
};
const sortedMentors = [...mentors]
  .map((m) => ({
    ...m,
    score: computeMatchScore(m),
  }))
  .sort((a, b) => b.score - a.score);



  // We fetch mentors only when the user explicitly clicks "Match with Alumni".
  // This avoids showing results before the student provides input.

  async function fetchMentors() {
    if (!user?.id) return;

    setLoading(true);
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, name, job_title, role, current_company, skills, availability")
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
        job_title: m.job_title ?? null,
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

  if (!profile) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

  return (
    <StudentGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
                Student Dashboard
              </h1>
              <p className="mt-2 text-base text-muted-foreground">
                Find and connect with alumni mentors matched to your career goals
              </p>
            </div>

            {user && (
              <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-2">
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                  {user.name?.[0]?.toUpperCase() ?? "U"}
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Student</p>
                </div>
              </div>
            )}
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT COLUMN - Profile Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-lg border bg-card p-6 space-y-3">
                <h3 className="text-lg font-semibold">Your Profile</h3>

                <p><strong>Name:</strong> {profile.full_name}</p>
                <p><strong>Skills:</strong> {profile.skills.join(", ")}</p>
                <p><strong>Target Role:</strong> {profile.target_role}</p>
                <p><strong>Companies:</strong> {profile.target_companies?.join(", ")}</p>

                <Button
                  variant="outline"
                  onClick={() => router.push("/profile/setup")}
                >
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* RIGHT COLUMN - Matched Alumni */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Matched Alumni
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Based on your skills, role, and target companies
                    </p>
                  </div>
                </div>


                {loading ? (
                  <div className="flex items-center justify-center py-12 rounded-lg border border-border bg-card/50">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : mentors.length === 0 ? (
                  <div className="rounded-lg border-2 border-dashed border-border bg-card/30 p-8 text-center">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">No mentors found yet</p>
                      <p className="text-xs text-muted-foreground">Complete your profile above and click "Match with Alumni" to get started</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sortedMentors.map((m) => (
                      <MentorCard 
                        key={m.id}
                        mentor={m} 
                        matchScore={m.score} 
                        onMessage={messageMentor} 
                      />
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
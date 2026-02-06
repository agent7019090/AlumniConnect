/**
 * Find Mentors Page - Main Application Interface
 * 
 * This page implements the core functionality of AlumniInReach:
 * - Left panel: Student profile form for input collection
 * - Right panel: Matched alumni results with compatibility scores
 * 
 * The split-screen design separates data input (light theme) from
 * results display (dark theme) for clear visual hierarchy.
 * 
 * Matching Algorithm Weights:
 * - Skill overlap: x2 weight (technical compatibility)
 * - Role alignment: x3 weight (career path match)
 * - Company match: x5 weight (highest priority for placement)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React from "react";
import { Sparkles, Info, User, LogOut, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

const DEFAULT_ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Developer",
  "Full Stack Developer",
  "Data Scientist",
  "Product Manager",
];

/**
 * Main page component for the mentor matching interface
 * Manages form state and matching algorithm execution
 * Protected route - requires authentication
 */
export default function FindMentorsPage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();

  /*
   * UI State Management
   * - mentors: Array of mentor profiles fetched from Supabase
   * - loadingMentors: Loading state during profile fetch
   */

  // This page is for students only — use effect-based redirects to avoid router changes during render
  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "student") {
      router.replace("/mentor/dashboard");
      return;
    }
  }, [isLoading, user, router]);

  // While auth hydrates or redirect is pending, show loading
  if (isLoading || !user || user.role !== "student") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
    );
  }
  const [mentors, setMentors] = useState<Array<{
    id: string;
    name?: string | null;
    role?: string | null;
    company?: string | null;
    title?: string | null;
    skills?: string[] | null;
    availability?: boolean | null;
    matchScore?: number;
  }>>([]);
  const [roles, setRoles] = useState<string[]>(DEFAULT_ROLES);
  const [loadingMentors, setLoadingMentors] = useState(false);

  /*
   * Form State Management
   * - studentName: For personalized communication with mentors
   * - skills: Comma-separated technical skills (e.g., "Java, Python, React")
   * - targetRole: Desired job position from predefined list
   * - targetCompanies: Comma-separated dream companies
   */
  const [studentName, setStudentName] = useState("");
  const [skills, setSkills] = useState("Java");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [targetCompanies, setTargetCompanies] = useState("Google");

  // Fetch roles and mentors from Supabase
  useEffect(() => {
    async function fetchRoles() {
      try {
        const { data } = await supabase.from("profiles").select("role");
        if (data) {
          const unique = Array.from(new Set((data as any[]).map((r) => r.role).filter(Boolean)));
          if (unique.length) setRoles(unique as string[]);
        }
      } catch (e) {
        console.error("fetchRoles failed:", e);
      }
    }
    fetchRoles();
  }, []);

  async function fetchMentors() {
    setLoadingMentors(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, role, company, title, skills, availability")
        .eq("role", "mentor")
        .eq("availability", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("fetchMentors error:", error.message || error);
        setMentors([]);
        setLoadingMentors(false);
        return;
      }

      const mapped = (data || []).map((m: any) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        company: m.company,
        title: m.title,
        skills: Array.isArray(m.skills) ? m.skills : (m.skills ? [m.skills] : []),
        availability: typeof m.availability === "boolean" ? m.availability : true,
      }));

      setMentors(mapped);
    } catch (e) {
      console.error("fetchMentors exception:", e);
      setMentors([]);
    } finally {
      setLoadingMentors(false);
    }
  }

  // Student -> start a conversation with mentor
  async function startConversation(mentorId: string) {
    if (!user) {
      // Prompt login for unauthenticated students
      router.push("/auth/login");
      return;
    }

    // Check mentor availability defensively
    let mentorAvailable = true;
    try {
      const { data: mentor, error } = await supabase
        .from("profiles")
        .select("availability")
        .eq("id", mentorId)
        .single();

      if (!error && mentor) {
        mentorAvailable = typeof mentor.availability === "boolean" ? mentor.availability : true;
      }
    } catch (e) {
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

    if (existing && (existing as any).id) {
      router.push(`/student/inbox/${(existing as any).id}`);
      return;
    }

    // Create or reuse conversation (upsert on student_id + mentor_id to avoid duplicates)
    const { data, error } = await supabase
      .from("conversations")
      .upsert({ student_id: user.id, mentor_id: mentorId, updated_at: new Date() }, { onConflict: "student_id,mentor_id" })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    router.push(`/student/inbox/${(data as any).id}`);
  }

  // Pre-fill name from authenticated user (safe fallback if name is null)
  useEffect(() => {
    if (user && !studentName) setStudentName(user?.name ?? "");
  }, [user, studentName]);

  /**
   * Handle user logout
   * Clears session and redirects to login
   */
  const handleLogout = async () => {
    await signOut();
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Page is public — allow rendering for unauthenticated users. Actions that require login will redirect to /auth/login.

  // Helper: safely compute avatar initial (name > email > '?')
  const getAvatarInitial = () => {
    const text = (user?.name ?? user?.email ?? "") as string;
    return text.length > 0 ? text.charAt(0).toUpperCase() : "?";
  };


  // For now, matching is handled by showing mentors from Supabase.
  // Use "Find mentors" button to refresh the mentor list from the database.
  const computeMatchScore = (mentor: any) => {
    const studentSkills = (skills || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const mentorSkills = (mentor.skills || []).map((s: string) => String(s).toLowerCase());
    const skillOverlap = studentSkills.reduce((acc, s) => acc + (mentorSkills.includes(s) ? 1 : 0), 0);

    const studentCompanies = (targetCompanies || "").split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    const companyMatch = mentor.company ? studentCompanies.includes(String(mentor.company).toLowerCase()) : false;

    const roleMatch = mentor.title ? String(mentor.title).toLowerCase() === String(targetRole || "").toLowerCase() : (mentor.role ? String(mentor.role).toLowerCase() === String(targetRole || "").toLowerCase() : false);

    const score = skillOverlap * 2 + (companyMatch ? 5 : 0) + (roleMatch ? 3 : 0);
    return score;
  };

  const handleFindMentors = async () => {
    await fetchMentors();

    // Apply client-side scoring + sorting
    setMentors(prev => prev.map((m) => ({ ...m, matchScore: computeMatchScore(m) })).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0)));
  };

  /**
   * Resets all form fields and clears results
   * Allows users to start fresh with new criteria
   */
  const handleReset = () => {
    setStudentName("");
    setSkills("");
    setTargetRole("");
    setTargetCompanies("");
    setMentors([]);
  };

  return (
    <div className="flex min-h-screen">
      {/*
       * LEFT PANEL - Student Profile Form
       * Light background for clear data entry
       * Contains all input fields and action buttons
       */}
      <div className="w-full bg-background lg:w-[45%]">
  
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.name ?? user?.email ?? ""}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email ?? ""}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="capitalize">
                  <User className="mr-2 h-4 w-4" />
                  Role: {user.role}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Form Container */}
        <div className="p-6 lg:p-8">
          {/* Form Card with Subtle Border */}
          <div className="rounded-lg border border-border bg-card p-6">
            {/* Section Header with Icon */}
            <div className="mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-foreground" />
              <h2 className="text-xl font-semibold text-card-foreground">
                Student Profile
              </h2>
            </div>

            {/* Form Fields Container */}
            <div className="space-y-5">
              {/*
               * Student Name Field
               * Used for personalized mentor communication
               */}
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-card-foreground"
                >
                  Student Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="border-border bg-card text-card-foreground placeholder:text-muted-foreground"
                />
              </div>

              {/*
               * Skills Input Field
               * Accepts comma-separated technical skills
               * Used for skill overlap calculation (x2 weight)
               */}
              <div className="space-y-2">
                <Label
                  htmlFor="skills"
                  className="text-sm font-medium text-card-foreground"
                >
                  Your Skills{" "}
                  <span className="font-normal text-muted-foreground">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="skills"
                  placeholder="Java, Python, React, SQL"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="border-border bg-card text-card-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  List your technical skills separated by commas
                </p>
              </div>

              {/*
               * Target Role Dropdown
               * Predefined roles for consistent matching
               * Used for role alignment calculation (x3 weight)
               */}
              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-card-foreground"
                >
                  Target Role
                </Label>
                <Select value={targetRole} onValueChange={setTargetRole}>
                  <SelectTrigger
                    id="role"
                    className="border-border bg-card text-card-foreground"
                  >
                    <SelectValue placeholder="Select your target role" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-popover">
                    {(roles && roles.length ? roles : TARGET_ROLES).map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className="text-popover-foreground"
                      >
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/*
               * Target Companies Input
               * Accepts comma-separated company names
               * Used for company match calculation (x5 weight - highest priority)
               */}
              <div className="space-y-2">
                <Label
                  htmlFor="companies"
                  className="text-sm font-medium text-card-foreground"
                >
                  Target Companies{" "}
                  <span className="font-normal text-muted-foreground">
                    (comma-separated)
                  </span>
                </Label>
                <Input
                  id="companies"
                  placeholder="Google, Amazon, Microsoft"
                  value={targetCompanies}
                  onChange={(e) => setTargetCompanies(e.target.value)}
                  className="border-border bg-card text-card-foreground placeholder:text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  List your dream companies separated by commas
                </p>
              </div>

              {/*
               * Action Buttons
               * Match: Primary CTA - executes algorithm and displays results
               * Reset: Secondary action - clears all fields for fresh start
               */}
              <div className="flex gap-3 pt-2">
                {/*
                 * Primary Action: Match with Alumni
                 * Full-width dark button with icon
                 * Disabled state when inputs are empty
                 */}
                <Button
                  onClick={handleFindMentors}
                  disabled={loadingMentors}
                  className="flex-1 bg-foreground text-background hover:bg-foreground/90"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {loadingMentors ? "Finding..." : "Find mentors"}
                </Button>
                {/*
                 * Secondary Action: Reset Form
                 * Subtle ghost styling to reduce visual emphasis
                 * Icon-only on smaller screens for space efficiency
                 */}
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="text-muted-foreground hover:bg-secondary hover:text-card-foreground"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>

          {/*
           * Algorithm Explanation Card
           * Educates users about matching criteria and weights
           * Builds trust through transparency
           */}

        </div>
      </div>

      {/*
       * RIGHT PANEL - Matched Alumni Results
       * Dark background creates visual contrast with form
       * Displays sorted alumni cards with match percentages
       */}
      <div className="hidden w-[55%] bg-[#1a1f2e] p-6 lg:block lg:p-8">
        {/* Results Section Header */}
      <h2 className="mb-2 text-2xl font-semibold text-white">Mentors</h2>
        <p className="mb-6 text-xs text-gray-500">Message available mentors to start a conversation</p>

        {/*
         * Results Display Area
         * Shows either empty state prompt or matched alumni grid
         */}
        {loadingMentors ? (
          <div className="flex h-[calc(100vh-140px)] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : mentors.length === 0 ? (
          <div className="flex h-[calc(100vh-140px)] items-center justify-center">
            <p className="text-center text-gray-400">No mentors are available yet</p>
          </div>
        ) : (
          /*
           * Alumni Cards Grid
           * 2-column layout for optimal scanning
           * Cards sorted by match percentage (highest first)
           */
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              {mentors.map((mentor) => (
                <div key={mentor.id} className="rounded-xl bg-[#252a3a] p-4 transition-all hover:bg-[#2d3348]">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{mentor.name || "Unnamed"}</h3>
                      <p className="mt-1 text-sm text-gray-400">{mentor.title || mentor.role || ""}{mentor.company ? ` — ${mentor.company}` : ""}</p>
                      {mentor.skills && mentor.skills.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {mentor.skills.slice(0,5).map((s, i) => (
                            <span key={i} className="rounded-full bg-muted/20 px-2 py-1 text-xs text-muted-foreground">{s}</span>
                          ))}
                        </div>
                      )}
                    </div>

                    {mentor.availability && (
                      <Badge className="bg-emerald-500/20 text-xs text-emerald-400 hover:bg-emerald-500/20">Available</Badge>
                    )}
                  </div>

                  <div className="mt-4 border-t border-gray-600/50 pt-3">
                    <Button
                      onClick={() => startConversation(mentor.id)}
                      variant="outline"
                      className="w-full border-gray-600 bg-transparent text-gray-300 hover:bg-[#3a3f50] hover:text-white"
                      disabled={mentor.availability === false}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {/*
             * Messaging Info
             * Clarifies in-app messaging feature
             */}
            <p className="mt-6 text-center text-xs text-gray-600">
              Click &quot;Send Message&quot; to contact alumni directly through the platform
            </p>
          </div>
        )}
      </div>

      {/*
       * Mobile Results Panel
       * Shown below form on smaller screens
       * Same content as desktop right panel
       */}
      <div className="fixed inset-x-0 bottom-0 top-auto block bg-[#1a1f2e] p-4 lg:hidden">
        {mentors && mentors.length > 0 && (
          <div className="max-h-[40vh] overflow-y-auto">
            <h3 className="mb-3 text-lg font-semibold text-white">Mentors ({mentors.length})</h3>
            <div className="grid gap-3">
              {mentors.slice(0, 4).map((mentor) => (
                <div key={mentor.id} className="rounded-xl bg-[#252a3a] p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{mentor.name || "Unnamed"}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{mentor.title || mentor.role || ""}{mentor.company ? ` — ${mentor.company}` : ""}</div>
                    </div>

                    {mentor.availability && (
                      <Badge className="bg-emerald-500/20 text-xs text-emerald-400">Available</Badge>
                    )}
                  </div>

                  <div className="mt-3">
                    <Button onClick={() => startConversation(mentor.id)} disabled={mentor.availability === false} className="w-full">Send Message</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

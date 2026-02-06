"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function ProfileSetupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  // Shared fields
  const [name, setName] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [experienceYears, setExperienceYears] = useState("");

  // Student fields
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompanies, setTargetCompanies] = useState("");

  // Mentor fields
  const [mentorSkills, setMentorSkills] = useState("");
  const [availability, setAvailability] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
    // Pre-fill name/email if present
    if (user?.name) setName(user.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  if (isLoading) return null;
  if (!user) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const baseUpdate: any = {
        id: user.id,
        role: user.role || null,
        full_name: name || null,
        current_company: currentCompany || null,
        experience_years: experienceYears ? parseInt(experienceYears, 10) : null,
        profile_completed: true,
      };

      if (user.role === "student") {
        baseUpdate.skills = skills.split(",").map((s) => s.trim()).filter(Boolean);
        baseUpdate.target_role = targetRole || null;
        baseUpdate.target_companies = targetCompanies.split(",").map((s) => s.trim()).filter(Boolean);
      } else {
        // Mentor
        baseUpdate.skills = mentorSkills.split(",").map((s) => s.trim()).filter(Boolean);
        baseUpdate.availability = availability;
      }

      const { error } = await supabase.from("profiles").upsert(baseUpdate, { onConflict: "id" });
      if (error) {
        console.error("Profile setup upsert error:", error);
        alert(error.message || "Failed to save profile.");
        setLoading(false);
        return;
      }

      // Redirect to appropriate dashboard
      if (user.role === "student") router.replace("/student/dashboard");
      else router.replace("/mentor/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form onSubmit={handleSubmit} className="w-full max-w-lg p-8">
        <h2 className="text-lg font-semibold">Complete your profile</h2>
        <p className="mt-2 text-sm text-muted-foreground">This helps us match you with the right people.</p>

        <div className="mt-6 space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>

          <div>
            <Label>Current Company</Label>
            <Input value={currentCompany} onChange={(e) => setCurrentCompany(e.target.value)} placeholder="e.g. Google, startup name" />
          </div>

          <div>
            <Label>Years of Experience</Label>
            <Input type="number" value={experienceYears} onChange={(e) => setExperienceYears(e.target.value)} placeholder="e.g. 5" />
          </div>

          {user.role === "student" ? (
            <>
              <div>
                <Label>Skills (comma-separated)</Label>
                <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. Java, React, SQL" />
              </div>
              <div>
                <Label>Target Role</Label>
                <Input value={targetRole} onChange={(e) => setTargetRole(e.target.value)} placeholder="e.g. Software Engineer" />
              </div>
              <div>
                <Label>Target Companies (comma-separated)</Label>
                <Input value={targetCompanies} onChange={(e) => setTargetCompanies(e.target.value)} placeholder="e.g. Google, Meta" />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label>Skills (comma-separated)</Label>
                <Input value={mentorSkills} onChange={(e) => setMentorSkills(e.target.value)} placeholder="e.g. Node.js, System Design" />
              </div>
              <div className="flex items-center gap-3">
                <Label>Available to mentor</Label>
                <Switch checked={availability} onCheckedChange={(v: boolean) => setAvailability(v)} />
              </div>
            </>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Profile'}</Button>
          </div>
        </div>
      </form>
    </div>
  );
}

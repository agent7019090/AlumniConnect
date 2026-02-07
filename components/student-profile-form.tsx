"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentProfileForm({ compact = false }: { compact?: boolean }) {
  const { user, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [skills, setSkills] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [targetCompanies, setTargetCompanies] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "student") return;
    const userId = user.id;
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, skills, target_role, target_companies, bio")
          .eq("id", userId)
          .single();

        if (!mounted) return;
        if (!error && data) {
          setName((data as any).full_name ?? "");
          setSkills(((data as any).skills || []).join(", ") || "");
          setTargetRole((data as any).target_role ?? "");
          setTargetCompanies(((data as any).target_companies || []).join(", ") || "");
          setBio((data as any).bio ?? "");
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    return () => { mounted = false; };
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setLoading(true);
    try {
      const skillsArr = skills.split(",").map(s => s.trim()).filter(Boolean);
      const companiesArr = targetCompanies.split(",").map(s => s.trim()).filter(Boolean);
      
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name || null,
        skills: skillsArr,
        target_role: targetRole || null,
        target_companies: companiesArr,
        bio: bio || null,
        profile_completed: true
      }, { onConflict: "id" });
      
      if (error) {
        alert(error.message);
        return;
      }
      alert("Profile saved successfully");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !user || user.role !== "student") return null;

  if (compact) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="student-name">Full Name</Label>
          <Input 
            id="student-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-skills">Skills (comma-separated)</Label>
          <Input 
            id="student-skills" 
            value={skills} 
            onChange={(e) => setSkills(e.target.value)}
            placeholder="e.g. React, Python, SQL"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-role">Target Role</Label>
          <Input 
            id="student-role" 
            value={targetRole} 
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Frontend Engineer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="student-companies">Target Companies (comma-separated)</Label>
          <Input 
            id="student-companies" 
            value={targetCompanies} 
            onChange={(e) => setTargetCompanies(e.target.value)}
            placeholder="e.g. Google, Meta, Amazon"
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={saveProfile}>{loading ? "Saving..." : "Save profile"}</Button>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Profile</CardTitle>
        <CardDescription>Update your information to help us match you with the right mentors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <Label htmlFor="student-name-full">Full Name</Label>
            <Input 
              id="student-name-full" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-bio">About You</Label>
            <Textarea 
              id="student-bio" 
              value={bio} 
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell mentors about your background and goals..."
              className="min-h-20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-skills-full">Skills (comma-separated)</Label>
            <Input 
              id="student-skills-full" 
              value={skills} 
              onChange={(e) => setSkills(e.target.value)}
              placeholder="e.g. React, TypeScript, Python, SQL"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-role-full">Target Role</Label>
            <Input 
              id="student-role-full" 
              value={targetRole} 
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Engineer, Full Stack Developer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-companies-full">Target Companies (comma-separated)</Label>
            <Input 
              id="student-companies-full" 
              value={targetCompanies} 
              onChange={(e) => setTargetCompanies(e.target.value)}
              placeholder="e.g. Google, Meta, Amazon, Microsoft"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={saveProfile} disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlumniProfileForm({ compact = false }: { compact?: boolean }) {
  const { user, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [years, setYears] = useState("");
  const [skillsText, setSkillsText] = useState("");
  const [bio, setBio] = useState("");
  const [expertise, setExpertise] = useState("");
  const [availability, setAvailability] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "mentor") return;
    const userId = user.id;
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, current_company, job_title, experience_years, skills, bio, expertise, availability")
          .eq("id", userId)
          .single();

        if (!mounted) return;
        if (!error && data) {
          setName((data as any).full_name ?? "");
          setCompany((data as any).current_company ?? "");
          setJobTitle((data as any).job_title ?? "");
          setYears((data as any).experience_years ?? "");
          setSkillsText(((data as any).skills || []).join(", ") || "");
          setBio((data as any).bio ?? "");
          setExpertise((data as any).expertise ?? "");
          setAvailability(typeof (data as any).availability === "boolean" ? (data as any).availability : true);
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
      const skillsArr = skillsText.split(",").map(s => s.trim()).filter(Boolean);
      const yearsNum = years ? parseInt(years, 10) : null;
      
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name || null,
        current_company: company || null,
        job_title: jobTitle || null,
        experience_years: yearsNum,
        skills: skillsArr,
        bio: bio || null,
        expertise: expertise || null,
        availability,
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

  if (isLoading || !user || user.role !== "mentor") return null;

  if (compact) {
    return (
      <div className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <Label htmlFor="alumni-name">Full Name</Label>
          <Input 
            id="alumni-name" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alumni-company">Current Company</Label>
          <Input 
            id="alumni-company" 
            value={company} 
            onChange={(e) => setCompany(e.target.value)}
            placeholder="e.g. Google, Meta"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alumni-title">Job Title</Label>
          <Input 
            id="alumni-title" 
            value={jobTitle} 
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alumni-years">Years of Experience</Label>
          <Input 
            id="alumni-years" 
            type="number"
            value={years} 
            onChange={(e) => setYears(e.target.value)}
            placeholder="e.g. 5"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alumni-skills">Skills (comma-separated)</Label>
          <Input 
            id="alumni-skills" 
            value={skillsText} 
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="e.g. React, Node.js, System Design"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-medium">Availability</h4>
            <p className="text-xs text-muted-foreground">Available for mentoring</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm">Not Available</span>
            <Switch checked={availability} onCheckedChange={(v) => setAvailability(!!v)} />
            <span className="text-sm">Available</span>
          </div>
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
        <CardTitle>Alumni Profile</CardTitle>
        <CardDescription>Build your mentorship profile to help students find you</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="alumni-name-full">Full Name</Label>
            <Input 
              id="alumni-name-full" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alumni-title-full">Job Title</Label>
            <Input 
              id="alumni-title-full" 
              value={jobTitle} 
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alumni-company-full">Current Company</Label>
            <Input 
              id="alumni-company-full" 
              value={company} 
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Google, Meta, Microsoft"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alumni-years-full">Years of Experience</Label>
            <Input 
              id="alumni-years-full" 
              type="number"
              value={years} 
              onChange={(e) => setYears(e.target.value)}
              placeholder="e.g. 5"
              min="0"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="alumni-bio">About You</Label>
          <Textarea 
            id="alumni-bio" 
            value={bio} 
            onChange={(e) => setBio(e.target.value)}
            placeholder="Share your professional journey and what you're passionate about..."
            className="min-h-24"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alumni-expertise">Areas of Expertise</Label>
          <Textarea 
            id="alumni-expertise" 
            value={expertise} 
            onChange={(e) => setExpertise(e.target.value)}
            placeholder="e.g. Frontend development, system design, interview prep, career guidance..."
            className="min-h-20"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="alumni-skills-full">Technical Skills (comma-separated)</Label>
          <Input 
            id="alumni-skills-full" 
            value={skillsText} 
            onChange={(e) => setSkillsText(e.target.value)}
            placeholder="e.g. React, TypeScript, Node.js, System Design, AWS"
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/50">
          <div>
            <h4 className="text-sm font-semibold">Mentor Availability</h4>
            <p className="text-xs text-muted-foreground">When enabled, students can contact you</p>
          </div>
          <Switch checked={availability} onCheckedChange={(v) => setAvailability(!!v)} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button onClick={saveProfile} disabled={loading}>
            {loading ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

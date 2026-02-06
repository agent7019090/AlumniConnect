"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function MentorProfileForm({ compact = false }: { compact?: boolean }) {
  const { user, isLoading } = useAuth();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [years, setYears] = useState("");
  const [skillsText, setSkillsText] = useState("");
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
          .select("full_name, current_company, experience_years, skills, availability")
          .eq("id", userId)
          .single();

        if (!mounted) return;
        if (!error && data) {
          setName((data as any).full_name ?? "");
          setCompany((data as any).current_company ?? "");
          setYears((data as any).experience_years ?? "");
          setSkillsText(((data as any).skills || []).join(", ") || "");
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
        experience_years: yearsNum,
        skills: skillsArr,
        availability
      }, { onConflict: "id" });
      if (error) {
        alert(error.message);
        return;
      }
      alert("Profile saved");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !user || user.role !== "mentor") return null;

  return (
    <div className={`space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm`}>
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Current Company</Label>
        <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="years">Years of Experience</Label>
        <Input id="years" value={years} onChange={(e) => setYears(e.target.value)} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="skills">Skills (comma-separated)</Label>
        <Input id="skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium">Availability</h4>
          <p className="text-xs text-muted-foreground">Available users can be messaged by students</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">Unavailable</span>
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

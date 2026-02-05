"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function MentorProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [skillsText, setSkillsText] = useState(""); // comma-separated UI
  const [availability, setAvailability] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    // If user exists but is not a mentor, redirect away
    if (!isLoading && user && user.role !== "mentor") {
      router.push("/find-mentors");
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "mentor") return;
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("name, company, title, skills, availability")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("load profile error:", error.message || error);
          return;
        }

        if (!mounted) return;
        setName(data?.name ?? "");
        setCompany(data?.company ?? "");
        setTitle(data?.title ?? "");
        setSkillsText((data?.skills || []).join(", ") || "");
        setAvailability(typeof data?.availability === "boolean" ? data.availability : true);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [user]);

  async function saveProfile() {
    if (!user) return;
    setLoading(true);
    try {
      const skillsArr = skillsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const { error } = await supabase
        .from("profiles")
        .upsert({ id: user.id, name: name || null, company: company || null, title: title || null, skills: skillsArr, availability }, { onConflict: "id" });

      if (error) {
        alert(error.message);
        return;
      }

      alert("Profile saved");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) return null;
  if (!user || user.role !== "mentor") return null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold">Mentor Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your public mentorship profile</p>

        <div className="mt-6 space-y-4 rounded-lg border border-border bg-card p-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Job Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Skills (comma-separated)</Label>
            <Input id="skills" value={skillsText} onChange={(e) => setSkillsText(e.target.value)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium">Availability</h4>
              <p className="text-xs text-muted-foreground">Mark unavailable to prevent students from messaging you</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">Unavailable</span>
              <Switch checked={availability} onCheckedChange={(v) => setAvailability(!!v)} />
              <span className="text-sm">Available</span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveProfile} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

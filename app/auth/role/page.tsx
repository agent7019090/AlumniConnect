"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap } from "lucide-react";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ensure an authenticated session exists
    async function check() {
      const { data } = await supabase.auth.getSession();
      if (!data?.session) {
        router.replace("/auth/login");
      }
    }
    check();
  }, [router]);

  async function choose(role: "student" | "mentor") {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        alert("No authenticated user found. Please sign in again.");
        await (router.replace("/auth/login") as unknown as Promise<void>);
        return;
      }

      // Upsert id + role and mark profile as incomplete so user is sent to setup
      const { error } = await supabase.from("profiles").upsert({ id: userId, role, profile_completed: false }, { onConflict: "id" });
      if (error) {
        console.error("Profile upsert error:", error);
        // If the error is about the availability column, try a simpler upsert without that column (defensive)
        const msg = (error as any).message || "";
        if (msg.toLowerCase().includes("availability") || msg.toLowerCase().includes("column") || msg.toLowerCase().includes("could not find")) {
          const { error: err2 } = await supabase.from("profiles").upsert({ id: userId, role });
          if (err2) {
            console.error("Profile upsert retry failed:", err2);
            setLoading(false);
            return;
          }
        } else {
          setLoading(false);
          return;
        }
      }

      // Send the user to the profile setup flow immediately after role selection
      await (router.replace("/profile/setup") as unknown as Promise<void>);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">AC</div>
            <span className="text-xl font-bold">Alumni<span className="text-primary">Reach</span></span>
          </div>
          <h1 className="text-3xl font-bold mt-4">Choose Your Role</h1>
          <p className="mt-2 text-muted-foreground">Select how you want to use AlumniInReach</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Card */}
          <Card 
            className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
            onClick={() => choose("student")}
          >
            <CardHeader className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <GraduationCap className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl">I'm a Student</CardTitle>
              <CardDescription>Looking for mentorship and guidance</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Get matched with alumni mentors</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Receive career guidance and advice</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Access interview preparation tips</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Connect with professionals in your field</span>
                </div>
              </div>
              <Button 
                onClick={() => choose("student")} 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                disabled={loading}
              >
                {loading ? "Setting up..." : "Continue as Student"}
              </Button>
            </CardContent>
          </Card>

          {/* Alumni/Mentor Card */}
          <Card 
            className="cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all"
            onClick={() => choose("mentor")}
          >
            <CardHeader className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Users className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
              <CardTitle className="text-xl">I'm an Alumni</CardTitle>
              <CardDescription>Ready to mentor and guide students</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Mentor the next generation</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Share your industry expertise</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Make a meaningful impact</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-primary">✓</span>
                  <span>Build your mentorship profile</span>
                </div>
              </div>
              <Button 
                onClick={() => choose("mentor")} 
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? "Setting up..." : "Continue as Alumni"}
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          You can change your role anytime from your dashboard settings.
        </p>
      </div>
    </div>
  );
}

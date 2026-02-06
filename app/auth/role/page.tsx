"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <h2 className="text-lg font-semibold">Welcome to AlumniConnect</h2>
        <p className="mt-2 text-sm text-muted-foreground">Choose how you&apos;d like to use the platform</p>

        <div className="mt-6 flex gap-3">
          <Button onClick={async () => await choose("student")} className="flex-1" disabled={loading}>
            Continue as Student
          </Button>

          <Button onClick={async () => await choose("mentor")} className="flex-1" disabled={loading}>
            Continue as Mentor
          </Button>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">You can change your availability later in your mentor dashboard.</p>
      </div>
    </div>
  );
}
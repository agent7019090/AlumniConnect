"use client";

import React, { useEffect } from "react";
import AlumniProfileForm from "@/components/alumni-profile-form";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { MentorGuard } from "@/components/guards";
import { Loader2 } from "lucide-react";

export default function MentorProfilePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not logged in, send to login; MentorGuard handles cross-role redirects
    if (!isLoading && !user) router.replace("/auth/login");
  }, [user, isLoading, router]);

  if (isLoading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>;

  return (
    <MentorGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10 py-8 px-6">
        <div className="max-w-3xl mx-auto">
          <AlumniProfileForm />
        </div>
      </div>
    </MentorGuard>
  );
}

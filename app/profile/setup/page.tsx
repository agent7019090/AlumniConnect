"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";
import StudentProfileForm from "@/components/student-profile-form";
import AlumniProfileForm from "@/components/alumni-profile-form";

export default function ProfileSetupPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 py-12 px-4">
      <div className="w-full max-w-2xl">
        {user.role === "student" ? (
          <StudentProfileForm />
        ) : (
          <AlumniProfileForm />
        )}
      </div>
    </div>
  );
}

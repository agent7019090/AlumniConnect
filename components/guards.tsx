"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Loader2 } from "lucide-react";

export function StudentGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
    // If profile isn't completed, send to setup
    if (user.profile_completed === false) {
      router.replace("/profile/setup");
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  );
  if (!user) return null;
  if (user.role !== "student") return null;
  return <>{children}</>;
}

export function MentorGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/auth/login");
      return;
    }
    if (user.role !== "mentor") {
      router.replace("/student/dashboard");
      return;
    }
    if (user.profile_completed === false) {
      router.replace("/profile/setup");
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) return (
    <div className="flex min-h-[300px] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  );
  if (!user) return null;
  if (user.role !== "mentor") return null;
  return <>{children}</>;
}

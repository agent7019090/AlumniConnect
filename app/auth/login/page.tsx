"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AuthLoginPage() {
  const { user, isLoading, signInWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Redirect already-authenticated users (inside useEffect to avoid router update during render)
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "mentor") router.replace("/mentor/dashboard");
      else if (user.role === "student") router.replace("/student/dashboard");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  async function handleSignIn() {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Sign in to AlumniConnect</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in with Google to continue</p>
        </div>

        <div className="space-y-4">
          <Button onClick={handleSignIn} className="w-full">
            Continue with Google
          </Button>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-xs text-muted-foreground">If this is your first sign-in, you'll be asked to choose a role (Student or Mentor).</p>
        </div>
      </div>
    </div>
  );
}
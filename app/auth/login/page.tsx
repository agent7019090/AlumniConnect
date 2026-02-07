"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

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
    <div className="flex min-h-screen items-center justify-center py-12 px-4 brand-gradient">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-sm">AR</div>
            <span className="text-xl font-bold">Alumni<span className="text-primary">In</span>Reach</span>
          </div>
        </div>

        <Card className="bg-background/95 backdrop-blur rounded-xl shadow-lg">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in with Google to continue to your dashboard</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button 
              onClick={handleSignIn} 
              className="w-full bg-white text-black hover:bg-gray-50 border border-border font-semibold h-11 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Continue with Google"}
            </Button>

            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border"></span>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">New to AlumniInReach?</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Sign in first, then choose your role (Student or Alumni).
            </p>
          </CardContent>
        </Card>

        <div className="mt-6 rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-3">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-semibold text-foreground mb-1">AI-Powered Matching</p>
              <p>We match students with the perfect alumni mentors based on skills, roles, and career goals.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

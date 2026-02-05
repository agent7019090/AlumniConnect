"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let didCancel = false;

    async function waitForSession(timeoutMs = 5000) {
      const start = Date.now();
      while (Date.now() - start < timeoutMs) {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        if (session) return session;
        await new Promise((r) => setTimeout(r, 300));
      }
      return null;
    }

    async function handleCallback() {
      try {
        // Try to parse session from URL if available (compatibility). Do not fail if it throws.
        if ((supabase.auth as any).getSessionFromUrl) {
          try {
            await (supabase.auth as any).getSessionFromUrl({ storeSession: true });
          } catch (e) {
            // Ignore parse errors; we'll try to read session below
            console.info("getSessionFromUrl did not return a session (ignored)",
              typeof e === "string" ? e : (e as any)?.message ?? e
            );
          }
        }

        // Wait briefly for Supabase to persist session after redirect (addresses bad_oauth_state)
        const session = await waitForSession(5000);
        if (!session) {
          console.error("Callback: no session available after redirect");
          if (!didCancel) router.replace("/auth/login");
          return;
        }

        const userId = session.user.id;

        // Read profile (auth-client read only).
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", userId)
          .single();

        // Check whether this callback was the result of an explicit sign-in by inspecting the URL
        let justSignedIn = false;
        try {
          if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            justSignedIn = params.get("signup") === "1";
          }
        } catch (e) {
          justSignedIn = false;
        }

        if (profileErr || !profile) {
          console.info("Profile missing or unreadable", profileErr?.message || "no profile");
          // Only redirect to role selection if the user has just signed in; otherwise, send them to login
          if (!didCancel) {
            if (justSignedIn) router.replace("/auth/role");
            else router.replace("/auth/login");
          }
          return;
        }

        // Map legacy roles
        const role = profile?.role === "alumni" ? "mentor" : profile?.role;

        if (!role) {
          // Only send to role selection when an explicit sign-in just occurred
          if (!didCancel) {
            if (justSignedIn) router.replace("/auth/role");
            else router.replace("/auth/login");
          }
          return;
        }

        if (!didCancel) {
          if (role === "student") router.replace("/student/dashboard");
          else router.replace("/mentor/dashboard");
        }
      } catch (err) {
        console.error("Error handling auth callback:", err);
        if (!didCancel) router.replace("/auth/login");
      }
    }

    handleCallback();

    return () => {
      didCancel = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
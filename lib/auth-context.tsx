/**
 * Authentication Context Provider
 * 
 * Manages user authentication state across the application.
 * For hackathon demo purposes, this uses localStorage to persist
 * user sessions. In production, this would integrate with Supabase Auth.
 * 
 * Features:
 * - Login/Signup with email and password
 * - Role-based access (Student or Alumni)
 * - Session persistence across page refreshes
 * - Protected route support
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";

/**
 * User object structure sourced from `profiles` table
 */
export interface User {
  id: string; // equals supabase auth user id
  email?: string;
  name?: string | null;
  role?: "student" | "mentor" | null;
  availability?: boolean | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function load() {
      setIsLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session?.user) {
        await fetchAndSetProfile(session.user.id);
      } else {
        setUser(null);
      }

      // Listen to auth state changes
      const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          await fetchAndSetProfile(session.user.id);
        } else {
          // No session — clear local user state. Protected pages handle redirects to login as needed.
          setUser(null);
        }
      });

      setIsLoading(false);

      return () => {
        mounted = false;
        listener.subscription.unsubscribe();
      };
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchAndSetProfile(userId: string) {
    // Fetch profile from Supabase
    // Fetch profile without assuming an 'email' column exists on profiles
  let { data, error } = await supabase
    .from("profiles")
    .select("id, name, role, availability")
    .eq("id", userId)
    .single();

  // If availability column is missing, retry without it
  if (error) {
    const msg = (error as any).message || "";
    if (msg.toLowerCase().includes("availability") || msg.toLowerCase().includes("column") || msg.toLowerCase().includes("could not find")) {
      const retry = await supabase.from("profiles").select("id, name, role").eq("id", userId).single();
      data = retry.data as any;
      error = retry.error as any;
    }
  }

  // Fetch authenticated user's email from auth service (not from profiles table)
  let authEmail: string | undefined = undefined;
  try {
    const { data: authData } = await supabase.auth.getUser();
    authEmail = authData?.user?.email ?? undefined;
  } catch (e) {
    // ignore auth.getUser errors — we still proceed without email
    authEmail = undefined;
  }

  if (data) {
    // Normalize role values (legacy 'alumni' -> 'mentor')
    let roleVal: "student" | "mentor" | null = null;
    if (data.role === "student") roleVal = "student";
    else if (data.role === "mentor" || data.role === "alumni") roleVal = "mentor";

    const profile: User = {
      id: data.id,
      name: data.name,
      role: roleVal,
      availability: typeof data.availability === "boolean" ? data.availability : null,
      email: authEmail,
    };

    // Set profile in context. Do NOT redirect here — onboarding is handled after explicit login or in protected routes.
    setUser(profile);
  } else {
    // Profile not found — do NOT create a profile here. Auth context is READ-ONLY.
    // Set minimal local user state (do not set role=null) so UI can handle onboarding.
    // Include the authenticated email if available so UIs can still show the user's email.
    setUser({ id: userId, name: null, availability: null, email: authEmail });
  }
  }

  async function signInWithGoogle() {
    try {
      // Include a query flag in the redirect URL so the callback can determine
      // that this flow originated from an explicit sign-in (no storage used).
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/callback?signup=1` : undefined;
      const res = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo } });
      // If provider is disabled, Supabase may return an error object
      if ((res as any).error) {
        throw (res as any).error;
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      // Provide a helpful message for common misconfiguration
      const msg = err?.message || err?.error_description || "Unsupported provider: provider is not enabled";
      alert(`Google sign-in failed: ${msg}.\n\nEnable Google in Supabase Dashboard → Authentication → Providers and add the required OAuth client credentials.`);
      throw err;
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error signing out:", e);
    }
    // Clear local context state — auth session has been removed.
    setUser(null);
    router.push("/");
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

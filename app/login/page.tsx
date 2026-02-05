/**
 * Login/Signup Page
 * 
 * Unified authentication page for both students and alumni.
 * Features a tabbed interface to switch between login and signup modes.
 * 
 * Design:
 * - Split layout matching the main app aesthetic
 * - Left panel: Auth form on light background
 * - Right panel: Branding and feature highlights on dark background
 */

"use client";

import { useEffect } from "react"

import React from "react"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap,
  Users,
  Sparkles,
  Shield,
  MessageSquare,
  CheckCircle,
  Loader2,
} from "lucide-react";

/**
 * LoginPage Component
 * 
 * Handles both login and signup flows in a single page.
 * Automatically redirects authenticated users based on their role:
 * - Students go to /find-mentors (mentor matching page)
 * - Alumni go to /alumni-dashboard (incoming requests)
 */
export default function LoginPage() {
  const router = useRouter();

  // Redirect must happen inside useEffect to avoid updating router during render
  useEffect(() => {
    // Use replace so browser history isn't polluted
    router.replace("/auth/login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render nothing while redirecting
  return null;
}

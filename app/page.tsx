/**
 * AlumniConnect - Home Page
 * 
 * Landing page for the Alumni-Student Mentorship Platform.
 * Introduces the platform's value proposition and guides users
 * to the main mentor matching functionality.
 * 
 * Page Structure:
 * 1. Header with navigation
 * 2. Hero section with main CTA
 * 3. Problem statement explaining the need
 * 4. Features overview (3-step process)
 * 5. Final CTA section
 * 6. Footer
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, Sparkles, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

/**
 * HomePage Component
 * 
 * Renders the landing page with marketing content and navigation
 * to the main mentor matching feature.
 */
export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // Safely compute avatar initial without calling charAt on null/undefined
  const avatarInitial = (() => {
    const text = (user?.name ?? user?.email ?? "") as string;
    return text.length > 0 ? text.charAt(0).toUpperCase() : "?";
  })();

  return (
    <main className="min-h-screen bg-background">


      {/*
       * Hero Section
       * Main value proposition and primary CTA
       * Designed to quickly communicate platform purpose
       */}
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        {/* Main Headline with Gradient Accent */}
        <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground md:text-5xl">
          Connect with Alumni for
          <span className="block text-primary">Placement Success</span>
        </h1>

        {/* Supporting Description */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Get personalized mentorship from alumni who have been in your shoes.
          Our matching algorithm connects you with the right mentors based on
          your skills, target roles, and dream companies.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-10">
          <Button
            size="lg"
            className="bg-foreground px-8 py-6 text-lg text-background hover:bg-foreground/90"
            onClick={() => {
              if (!user) {
                router.push('/auth/login');
              } else if (user.role === 'student') {
                router.push('/student/dashboard');
              } else if (user.role === 'mentor') {
                router.push('/mentor/dashboard');
              } else {
                // Unknown role: send to role selection
                router.push('/auth/role');
              }
            }}
          >
            <Users className="mr-2 h-5 w-5" />
            Find Alumni Mentors
          </Button>
        </div>
      </section>

      {/*
       * Problem Statement Section
       * Explains the gap this platform addresses
       * Builds empathy and establishes credibility
       */}
      <section className="bg-secondary/50 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-foreground">
            The Problem We Solve
          </h2>

          {/* Problem/Solution Card */}
          <div className="mx-auto mt-8 max-w-3xl">
            <Card className="border-2 border-primary/20 bg-card">
              <CardContent className="p-6">
                {/* Problem Description */}
                <p className="text-lg leading-relaxed text-card-foreground">
                  Colleges have <strong>alumni willing to guide students</strong>
                  , but there is no structured system for mentorship, referrals,
                  or experience sharing. Currently, interaction happens{" "}
                  <strong>randomly on WhatsApp or LinkedIn</strong> and benefits
                  only a few students.
                </p>

                {/* Solution Description */}
                <p className="mt-4 text-lg leading-relaxed text-card-foreground">
                  <strong className="text-primary">Our solution:</strong> A
                  platform that connects final-year students with alumni for
                  placement guidance based on skills, target roles, and companies
                  using intelligent matching.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/*
       * Features Section
       * Three-step process overview
       * Icons and cards create visual interest
       */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-foreground">
            How It Works
          </h2>

          {/* Feature Cards Grid */}
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/*
             * Step 1: Profile Creation
             * User inputs their information for matching
             */}
            <Card className="border-border bg-card text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Create Your Profile
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Enter your skills, target role, and dream companies to help us
                  understand your goals.
                </p>
              </CardContent>
            </Card>

            {/*
             * Step 2: Algorithm Matching
             * System processes and ranks alumni
             */}
            <Card className="border-border bg-card text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Smart Matching
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Our algorithm analyzes skill overlap, role alignment, and
                  company relevance to find the best mentors.
                </p>
              </CardContent>
            </Card>

            {/*
             * Step 3: Connection
             * User reaches out to matched mentors
             */}
            <Card className="border-border bg-card text-center">
              <CardContent className="p-6">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground">
                  Connect & Grow
                </h3>
                <p className="mt-2 text-muted-foreground">
                  View matched alumni with clear explanations of why they&apos;re
                  a great fit for your career goals.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/*
       * Final CTA Section
       * Secondary call-to-action with subtle gradient background
       * Reinforces the main conversion goal
       */}
      <section className="bg-primary/5 py-16 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-3xl font-bold text-foreground">
            Ready to Find Your Mentor?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Start your journey towards placement success with personalized
            alumni guidance.
          </p>
          <div className="mt-8">
            <Link href="/find-mentors">
              <Button
                size="lg"
                className="bg-foreground px-8 py-6 text-lg text-background hover:bg-foreground/90"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/*
       * Footer
       * Simple footer with project description
       * Maintains consistent branding
       */}
      <footer className="border-t border-border bg-card py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-muted-foreground">
          <p>
            AlumniConnect — Alumni-Student Mentorship & Placement Guidance
            Platform
          </p>
        </div>
      </footer>
    </main>
  );
}

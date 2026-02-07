/**
 * AlumniInReach - Home Page
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
import { Users, Target, Sparkles, LogIn, CheckCircle } from "lucide-react";
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
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">


      {/*
       * Hero Section
       * Main value proposition and primary CTA
       * Designed to quickly communicate platform purpose
       */}
      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        {/* Main Headline with Gradient Accent */}
        <h1 className="text-balance text-5xl sm:text-6xl font-bold tracking-tighter text-foreground">
          Connect with Alumni for
          <span className="block bg-gradient-to-r from-primary via-primary to-primary/75 bg-clip-text text-transparent">Placement Success</span>
        </h1>

        {/* Supporting Description */}
        <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          Get personalized mentorship from alumni who have been in your shoes.
          Our intelligent matching connects you with the right mentors based on
          your skills, target roles, and dream companies.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-12">
          <Button
            size="lg"
            className="bg-gradient-to-r from-primary to-primary/90 px-10 py-7 text-lg font-semibold text-white hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all"
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
            Find Alumni Mentors Now
          </Button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>Free for students</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>AI-powered matching</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            <span>100% secure & private</span>
          </div>
        </div>
      </section>

      {/*
       * Problem Statement Section
       * Explains the gap this platform addresses
       * Builds empathy and establishes credibility
       */}
      <section className="border-y border-border bg-secondary/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-3xl font-bold text-foreground">
            The Challenge Students Face
          </h2>

          {/* Problem/Solution Card */}
          <div className="mx-auto mt-10 max-w-3xl">
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-8">
                {/* Problem Description */}
                <p className="text-lg leading-relaxed text-card-foreground">
                  Colleges have <strong className="text-primary">talented alumni and eager students</strong>,
                  but there's no structured way to connect them. Mentorship happens
                  <strong> randomly on WhatsApp or LinkedIn</strong>, leaving most students without
                  guidance.
                </p>

                {/* Solution Description */}
                <p className="mt-6 text-lg leading-relaxed text-card-foreground">
                  <strong className="text-primary">We solve this with intelligence:</strong> Our platform uses
                  AI matching to connect students with alumni mentors based on skills,
                  target roles, and companies—making mentorship accessible to everyone.
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
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">
              How AlumniInReach Works
            </h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to find your perfect mentor</p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid gap-8 md:grid-cols-3">
            {/*
             * Step 1: Profile Creation
             * User inputs their information for matching
             */}
            <Card className="border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground text-center">
                  1. Build Your Profile
                </h3>
                <p className="mt-3 text-muted-foreground text-center">
                  Tell us about your skills, target role, and dream companies.
                  This helps us understand your career goals.
                </p>
              </CardContent>
            </Card>

            {/*
             * Step 2: Algorithm Matching
             * System processes and ranks alumni
             */}
            <Card className="border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground text-center">
                  2. Get AI Matches
                </h3>
                <p className="mt-3 text-muted-foreground text-center">
                  Our intelligent algorithm analyzes skill overlap, role alignment,
                  and company relevance to find the best mentors for you.
                </p>
              </CardContent>
            </Card>

            {/*
             * Step 3: Connection
             * User reaches out to matched mentors
             */}
            <Card className="border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-primary/30 transition-colors">
              <CardContent className="p-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground text-center">
                  3. Connect & Grow
                </h3>
                <p className="mt-3 text-muted-foreground text-center">
                  Message your matched mentors, get guidance on interviews,
                  resume reviews, and career strategies directly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/*
       * Final CTA Section
       * Secondary call-to-action with gradient background
       * Reinforces the main conversion goal
       */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 py-20 border-y border-border">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-4xl font-bold text-foreground">
            Ready to Accelerate Your Career?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            Join hundreds of students who are already getting mentorship from
            alumni at top tech companies. Start for free today.
          </p>
          <div className="mt-10">
            <Link href="/auth/login">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-primary/90 px-10 py-7 text-lg font-semibold text-white hover:from-primary/90 hover:to-primary/80 shadow-lg hover:shadow-xl transition-all"
              >
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/*
       * Footer
       * Clean footer with project description and links
       * Maintains consistent branding
       */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold">AC</div>
                <span className="font-semibold">AlumniInReach</span>
              </div>
              <p className="text-sm text-muted-foreground">Alumni-Student Mentorship & Placement Guidance Platform</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">For Students</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/find-mentors" className="hover:text-foreground transition">Find Mentors</Link></li>
                <li><Link href="/auth/login" className="hover:text-foreground transition">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">For Alumni</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/login" className="hover:text-foreground transition">Become a Mentor</Link></li>
                <li><Link href="/auth/login" className="hover:text-foreground transition">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 AlumniInReach. Connecting students with mentors, enabling career success.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}

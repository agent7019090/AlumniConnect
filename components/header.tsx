"use client";

import React from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export default function Header() {
  const { user, isLoading, signOut, signInWithGoogle } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const onLogoClick = () => {
    if (!user) router.push("/");
    else if (user.role === "mentor") router.push("/mentor/dashboard");
    else router.push("/student/dashboard");
  };

  return (
    <header className="w-full border-b border-border bg-transparent px-6 py-4 backdrop-blur-sm header-float">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onLogoClick} className="flex items-center gap-3 text-lg font-semibold bg-transparent border-0">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-emerald-400 to-blue-500 shadow-md flex items-center justify-center text-white">AC</div>
            <span className="hidden sm:inline">AlumniInReach</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Unauthenticated users: show Login with Google */}
          {!isLoading && !user && (
            <Button onClick={async () => { try { await signInWithGoogle(); } catch (e) { console.error(e); } }}>Login with Google</Button>
          )}

          {/* Bell only for students AND only on student routes */}
          {!isLoading && user?.role === "student" && pathname?.startsWith("/student") && (
            <Button variant="ghost" onClick={() => router.push("/student/inbox")} aria-label="Open inbox">
              <Bell />
            </Button>
          )}

          {/* Profile avatar: click navigates to role-specific dashboard; small chevron opens dropdown */}
          {!isLoading && user && (
            <div className="flex items-center gap-2">
              <button onClick={() => user.role === "mentor" ? router.push('/mentor/dashboard') : router.push('/student/dashboard')} className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-8 w-8" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-md p-1 hover:bg-muted">
                    <ChevronDown />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={8} align="end">
                  {user.role === "student" && <DropdownMenuItem onClick={() => router.push("/student/dashboard")}>Student Dashboard</DropdownMenuItem>}
                  {user.role === "mentor" && <DropdownMenuItem onClick={() => router.push("/mentor/dashboard")}>Mentor Dashboard</DropdownMenuItem>}
                  <DropdownMenuItem onClick={() => router.push("/profile/setup")}>Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => { await signOut(); }}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

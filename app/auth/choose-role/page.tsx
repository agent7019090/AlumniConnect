"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

export default function ChooseRolePage() {
  // Legacy route - redirect to /auth/role
  if (typeof window !== "undefined") {
    window.location.replace("/auth/role");
  }
  return null;
}
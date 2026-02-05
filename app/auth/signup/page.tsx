"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  useEffect(() => {
    // Signup with email/password is deprecated in this app. Use Google login instead.
    router.replace("/login");
  }, [router]);

  return null;
}

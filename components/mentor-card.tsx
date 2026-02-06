"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  mentor: any;
  matchScore?: number;
  onMessage: (id: string) => void;
}

export default function MentorCard({ mentor, matchScore = 0, onMessage }: Props) {
  const pct = Math.min(100, Math.round((matchScore / 20) * 100));
  // normalize skills
  const skills: string[] = (mentor.skills || []).slice(0, 6).map((s: any) => String(s).trim()).filter(Boolean);

  const available = typeof mentor.availability === "boolean" ? mentor.availability : true;

  return (
    <div className={cn("rounded-lg p-4 shadow-lg", "bg-gradient-to-b from-[rgba(20,25,40,0.9)] via-[rgba(12,16,30,0.9)] to-[rgba(4,8,20,0.9)]")}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-lg font-semibold text-white">{mentor.name || "Mentor"}</div>
          <div className="mt-1 text-sm text-muted-foreground">{mentor.current_company ? `${mentor.current_company} • ${mentor.role || "Mentor"}` : (mentor.role || "Mentor")}</div>
        </div>
        <div>
          {available ? (
            <Badge className="bg-emerald-600 text-white">Available</Badge>
          ) : (
            <Badge className="bg-slate-600 text-white">Unavailable</Badge>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>Match</div>
          <div className="font-medium text-white">{pct}%</div>
        </div>
        <div className="mt-2">
          <Progress value={pct} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="rounded-full bg-white/6 px-2 py-1 text-xs text-white">{s}</span>
        ))}
      </div>

      <div className="mt-4">
        <Button onClick={() => onMessage(mentor.id)} className="w-full">Send Message</Button>
      </div>
    </div>
  );
}

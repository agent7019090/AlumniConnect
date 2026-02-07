"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  mentor: any;
  matchScore?: number;
  onMessage: (id: string) => void;
}

export default function MentorCard({ mentor, matchScore = 0, onMessage }: Props) {
  const pct = Math.min(100, Math.round(matchScore));
  const skills: string[] = (mentor.skills || []).slice(0, 5).map((s: any) => String(s).trim()).filter(Boolean);
  const available = typeof mentor.availability === "boolean" ? mentor.availability : true;

  // Determine match quality color
  const matchColor = pct >= 80 ? "text-emerald-500" : pct >= 60 ? "text-blue-500" : "text-amber-500";
  const matchBadgeColor = pct >= 80 ? "bg-emerald-500/10 text-emerald-600" : pct >= 60 ? "bg-blue-500/10 text-blue-600" : "bg-amber-500/10 text-amber-600";

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all hover:border-primary/50">
      <CardContent className="p-0">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-4 border-b border-border">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground">{mentor.name || "Mentor"}</h3>
              <div className="mt-2 text-sm text-muted-foreground space-y-1">
                {mentor.job_title && (
                  <div>{mentor.job_title}</div>
                )}
                {mentor.current_company && (
                  <div>@ {mentor.current_company}</div>
                )}
              </div>

            </div>
            {available ? (
              <Badge className="bg-emerald-500/20 text-emerald-600 border border-emerald-500/30">Available</Badge>
            ) : (
              <Badge className="bg-muted text-muted-foreground border border-muted">Unavailable</Badge>
            )}
          </div>
        </div>

        {/* Match Score */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">Match Score</span>
            </div>
            <span className={cn("text-2xl font-bold", matchColor)}>{pct}%</span>
          </div>
          <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all rounded-full", 
                pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : "bg-amber-500"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="px-6 py-4 border-b border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Skills</div>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <Badge key={s} variant="secondary" className="bg-secondary/80 text-foreground text-xs font-medium">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="px-6 py-4">
          <Button 
            onClick={() => onMessage(mentor.id)} 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold gap-2"
            disabled={!available}
          >
            <MessageCircle className="h-4 w-4" />
            {available ? "Send Message" : "Unavailable"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

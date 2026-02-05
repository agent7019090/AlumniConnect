/**
 * Alumni Card Component
 * 
 * Displays individual alumni information in a compact card format.
 * Designed for the dark-themed results panel.
 * 
 * Features:
 * - Alumni name and current position
 * - Visual match percentage progress bar
 * - One-line match explanation for instant explainability
 * - Matching skill badges
 * - In-app messaging system for direct communication
 * - "Available for mentoring" badge for accessible alumni
 * 
 * The gradient progress bar provides instant visual feedback
 * on match quality (green = high match, fades for lower matches)
 */

"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { MessageSquare, Send, CheckCircle2 } from "lucide-react";
import type { MatchResult } from "@/lib/matching-algorithm";
import { generateMatchExplanation } from "@/lib/matching-algorithm";

/**
 * Props interface for AlumniCard component
 * Receives the complete match result from the algorithm
 */
interface AlumniCardProps {
  result: MatchResult;
}

/**
 * AlumniCard Component
 * 
 * Renders a single alumni match result with:
 * - Name and professional details
 * - Match percentage visualization
 * - Why matched explanation (one sentence)
 * - Relevant skill badges
 * - Message button to contact alumni directly
 * 
 * In-app messaging allows students to reach out without
 * exposing personal contact information.
 * 
 * @param result - MatchResult object containing alumni data and match metrics
 */
export function AlumniCard({ result }: AlumniCardProps) {
  // Destructure the match result for easier access
  const { alumni, matchPercentage, skillMatches } = result;
  
  // Generate concise explanation for why this alumni was matched
  const matchExplanation = generateMatchExplanation(result);

  // Message dialog state management
  const [isOpen, setIsOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  /**
   * Handles message submission
   * In production, this would send to a backend API
   * For demo, simulates sending with a brief delay
   */
  const handleSendMessage = () => {
    if (!senderName.trim() || !senderEmail.trim() || !message.trim()) return;

    setIsSending(true);

    // Simulate API call delay for demo purposes
    setTimeout(() => {
      setIsSending(false);
      setIsSent(true);

      // Reset form after showing success
      setTimeout(() => {
        setIsOpen(false);
        setIsSent(false);
        setSenderName("");
        setSenderEmail("");
        setMessage("");
      }, 2000);
    }, 1000);
  };

  return (
    <div className="rounded-xl bg-[#252a3a] p-4 transition-all hover:bg-[#2d3348]">
      {/*
       * Alumni Header Section
       * Name, company/role, and availability badge
       */}
      <div className="flex items-start justify-between">
        <div>
          {/* Alumni Name - Primary identifier */}
          <h3 className="text-base font-semibold text-white">{alumni.name}</h3>

          {/* Company and Role - Format: "Company - Role" */}
          <p className="mt-1 text-sm text-gray-400">
            {alumni.company} • {alumni.role}
          </p>
        </div>
        
        {/*
         * Availability Badge
         * Shows when alumni has indicated they're open to mentoring
         * Helps students identify accessible mentors quickly
         */}
        {alumni.availableForCalls && (
          <Badge className="bg-emerald-500/20 text-xs text-emerald-400 hover:bg-emerald-500/20">
            Available
          </Badge>
        )}
      </div>

      {/*
       * Match Percentage Progress Bar
       * 
       * Visual representation of match quality:
       * - Full width background (dark gray)
       * - Filled portion shows match percentage
       * - Gradient: emerald to teal for smooth visual transition
       * - Width dynamically set based on normalized matchPercentage
       */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-600">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
          style={{ width: `${matchPercentage}%` }}
        />
      </div>

      {/* Match Percentage Text - Bold for emphasis */}
      <p className="mt-2 text-sm font-semibold text-white">
        {matchPercentage}% match
      </p>

      {/*
       * Why Matched Explanation
       * Single concise sentence explaining the primary match factors
       * Provides instant explainability for judges and users
       */}
      <p className="mt-1 text-xs text-gray-400">{matchExplanation}</p>

      {/*
       * Matching Skills Badges
       * Shows skills that contributed to the match score
       * Limited to 3 badges for visual cleanliness
       */}
      {skillMatches.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skillMatches.slice(0, 3).map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="bg-[#3a3f50] px-2 py-0.5 text-xs text-gray-300 hover:bg-[#3a3f50]"
            >
              {skill.toLowerCase()}
            </Badge>
          ))}
        </div>
      )}

      {/*
       * Message Section
       * In-app messaging replaces external contact details
       * Opens a dialog for composing and sending messages
       */}
      <div className="mt-4 border-t border-gray-600/50 pt-3">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            {/*
             * Send Message Button
             * Primary action for contacting the alumni
             * Full width for easy touch/click access
             */}
            <Button
              variant="outline"
              className="w-full border-gray-600 bg-transparent text-gray-300 hover:bg-[#3a3f50] hover:text-white"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogTrigger>

          {/*
           * Message Dialog
           * Contains form for composing message to alumni
           * Includes sender details and message body
           */}
          <DialogContent className="border-gray-700 bg-[#1a1f2e] text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                Message {alumni.name}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {alumni.role} at {alumni.company}
              </DialogDescription>
            </DialogHeader>

            {/*
             * Success State
             * Shown after message is sent successfully
             * Auto-closes dialog after brief display
             */}
            {isSent ? (
              <div className="flex flex-col items-center justify-center py-8">
                <CheckCircle2 className="mb-4 h-12 w-12 text-emerald-500" />
                <p className="text-lg font-medium text-white">Message Sent!</p>
                <p className="mt-1 text-sm text-gray-400">
                  {alumni.name.split(" ")[0]} will receive your message
                </p>
              </div>
            ) : (
              /*
               * Message Form
               * Collects sender info and message content
               */
              <div className="space-y-4 py-4">
                {/*
                 * Sender Name Field
                 * Required for personalized communication
                 */}
                <div className="space-y-2">
                  <Label htmlFor="sender-name" className="text-gray-300">
                    Your Name
                  </Label>
                  <Input
                    id="sender-name"
                    placeholder="Enter your full name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="border-gray-600 bg-[#252a3a] text-white placeholder:text-gray-500"
                  />
                </div>

                {/*
                 * Sender Email Field
                 * For alumni to respond back
                 */}
                <div className="space-y-2">
                  <Label htmlFor="sender-email" className="text-gray-300">
                    Your Email
                  </Label>
                  <Input
                    id="sender-email"
                    type="email"
                    placeholder="you@example.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="border-gray-600 bg-[#252a3a] text-white placeholder:text-gray-500"
                  />
                </div>

                {/*
                 * Message Body
                 * Main content area for mentorship request
                 */}
                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">
                    Message
                  </Label>
                  <Textarea
                    id="message"
                    placeholder={`Hi ${alumni.name.split(" ")[0]}, I found your profile on AlumniConnect and would love to connect with you regarding placement preparation...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="resize-none border-gray-600 bg-[#252a3a] text-white placeholder:text-gray-500"
                  />
                </div>

                {/*
                 * Messaging Tips
                 * Helps students write effective outreach messages
                 */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs font-medium text-amber-300">Tips:</p>
                  <ul className="mt-1 space-y-0.5 text-xs text-amber-200/80">
                    <li>• Introduce yourself and your background</li>
                    <li>• Be specific about what guidance you need</li>
                    <li>• Keep it concise and professional</li>
                  </ul>
                </div>
              </div>
            )}

            {/*
             * Dialog Footer with Send Button
             * Only shown when form is visible (not success state)
             */}
            {!isSent && (
              <DialogFooter>
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !senderName.trim() || !senderEmail.trim() || !message.trim()}
                  className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {isSending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

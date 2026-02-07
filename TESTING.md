# AlumniInReach - Testing & Verification Guide

## 🧪 Quick Start Testing

### 1. **Homepage (Landing Page)**
**URL:** `http://localhost:3000`
**Expected:**
- [ ] Large hero with gradient heading
- [ ] "Find Alumni Mentors Now" button
- [ ] Three trust badges below button
- [ ] "How AlumniInReach Works" section with 3 steps
- [ ] "Ready to Accelerate Your Career?" CTA section
- [ ] Footer with links

### 2. **Login Page**
**URL:** `http://localhost:3000/auth/login`
**Expected:**
- [ ] Gradient background
- [ ] Card with title "Welcome Back"
- [ ] Google OAuth button
- [ ] Divider text "New to AlumniInReach?"
- [ ] AI-Powered Matching feature highlight box
- [ ] Responsive on mobile

### 3. **Role Selection Page**
**URL:** `http://localhost:3000/auth/role` (After Google login)
**Expected:**
- [ ] Two colored cards: Student (blue) and Alumni (emerald)
- [ ] Student card shows 4 benefits
- [ ] Alumni card shows 4 benefits
- [ ] Buttons work and navigate to profile setup
- [ ] Gradient background
- [ ] Responsive grid layout

### 4. **Profile Setup - Student**
**URL:** `http://localhost:3000/profile/setup` (As student)
**Expected:**
- [ ] Shows `StudentProfileForm` (NOT job experience fields)
- [ ] Fields: Full Name, About You, Skills, Target Role, Target Companies
- [ ] Card layout with header
- [ ] Save Profile button
- [ ] **Crucially**: NO "Current Company" or "Years of Experience" fields
- [ ] Gradient background

### 5. **Profile Setup - Alumni**
**URL:** `http://localhost:3000/profile/setup` (As alumni)
**Expected:**
- [ ] Shows `AlumniProfileForm`
- [ ] Fields: Full Name, Job Title, Company, Years of Experience, Bio, Expertise, Skills, Availability
- [ ] Professional-focused form
- [ ] Availability toggle with clear feedback
- [ ] 2-column layout on desktop
- [ ] Save Profile button

### 6. **Student Dashboard**
**URL:** `http://localhost:3000/student/dashboard` (As student)
**Expected:**
- [ ] 3-column gradient background layout
- [ ] Left: Student profile form (compact version)
- [ ] Right: "AI Matched Alumni" section
- [ ] Mentor cards show:
  - Name and company
  - Availability badge (green or gray)
  - Match score % with colored progress bar
  - Skills as badges
  - "Send Message" button
- [ ] Empty state message if no mentors matched
- [ ] Responsive on mobile (stacks vertically)

### 7. **Alumni/Mentor Dashboard**
**URL:** `http://localhost:3000/mentor/dashboard` (As alumni)
**Expected:**
- [ ] 3-column gradient background layout
- [ ] Left: Alumni profile form (compact version)
- [ ] Right: Two cards:
  1. **Mentee Availability** - Toggle to enable/disable
  2. **Student Messages** - List of conversations
- [ ] Availability toggle shows clear feedback message
- [ ] Student conversations show name and last message
- [ ] Reply button on each conversation
- [ ] Empty state when no conversations
- [ ] Responsive on mobile

### 8. **Mentor Card**
**Appears in:** Student Dashboard
**Expected:**
- [ ] Clean card with gradient header
- [ ] Name and company/role displayed
- [ ] Green "Available" badge (or gray if unavailable)
- [ ] Match Score section with:
  - Zap icon
  - Percentage (0-100%)
  - Colored progress bar (green/blue/amber based on score)
- [ ] Skills section with skill badges
- [ ] "Send Message" button (disabled if unavailable)
- [ ] Hover effects (shadow increase, border color change)

### 9. **Mentor Profile Page**
**URL:** `http://localhost:3000/mentor/profile` (As alumni)
**Expected:**
- [ ] Full `AlumniProfileForm` (not compact)
- [ ] All alumni fields present
- [ ] Better spacing than dashboard version
- [ ] Gradient background
- [ ] Save Profile button

---

## 🔄 User Flow Testing

### Student Journey:
1. Visit homepage → "Find Alumni Mentors Now" button
2. Click → Login with Google
3. Login page → Google authentication
4. Role page → Select "I'm a Student"
5. Setup page → Fill student profile (NO job fields)
6. Redirected to student dashboard
7. Fill student profile from dashboard
8. See matched mentors with color-coded match scores
9. Click "Send Message" → Redirected to conversation

### Alumni Journey:
1. Visit homepage (or go to login)
2. Login with Google
3. Role page → Select "I'm an Alumni"
4. Setup page → Fill alumni profile (WITH job fields)
5. Redirected to alumni dashboard
6. Fill complete alumni profile (can update anytime)
7. Toggle "Mentee Availability" on
8. See student messages appear in list
9. Click "Reply" → Open conversation

---

## 💅 Design Verification

### Colors & Gradients
- [ ] Primary color used consistently (accent buttons, badges, borders)
- [ ] Gradient backgrounds on main pages (from-background via-background to-secondary/10)
- [ ] Card hover states with smooth transitions
- [ ] Match score colors: Green (80+), Blue (60-79), Amber (<60)

### Typography  
- [ ] Large, bold headlines (text-3xl font-bold or larger)
- [ ] Clear hierarchy (h1 > h2 > h3)
- [ ] Readable line height
- [ ] Proper use of font-semibold and font-medium

### Spacing
- [ ] Cards have consistent padding (p-6, p-8)
- [ ] Section spacing (py-12, py-20)
- [ ] Proper gap between grid items (gap-4, gap-6)
- [ ] Mobile padding respects edges (px-4)

### Responsive Design
- [ ] Mobile: Single column layouts
- [ ] Tablet: 2-3 column grids
- [ ] Desktop: Full 3-column layouts
- [ ] No horizontal scrolling on any device
- [ ] Buttons are touch-friendly (min h-11)

---

## 🐛 Known Behaviors to Verify

### Form Validation
- [ ] Required fields show validation errors
- [ ] Skills fields accept comma-separated values
- [ ] Years of experience only shows for alumni
- [ ] Bio/Expertise fields are optional

### Matching Algorithm
- [ ] Skill overlap (x2 weight)
- [ ] Role alignment (x3 weight)
- [ ] Company match (x5 weight)
- [ ] Scores range from 0-100%

### Availability
- [ ] Unavailable mentors show gray badge
- [ ] Send Message button is disabled for unavailable mentors
- [ ] Alumni can toggle availability and see immediate feedback
- [ ] Students see availability status correctly

### Database Integration
- [ ] Profile data persists after refresh
- [ ] Conversations load correctly
- [ ] Mentor list updates when profiles change
- [ ] Availability changes sync immediately

---

## 🚀 Performance Checks

- [ ] Homepage loads quickly (<3s)
- [ ] Dashboard loads with minimal flashing
- [ ] Profile forms don't have lag when typing
- [ ] Mentor cards render smoothly (no jank)
- [ ] Responsive transitions are smooth (no stuttering)

---

## 🎯 Critical Functionality

### Must Work:
1. [ ] Google OAuth login
2. [ ] Role selection route correct path
3. [ ] Student profile form saves to database
4. [ ] Alumni profile form saves to database (with all fields)
5. [ ] Mentor matching algorithm works
6. [ ] Messaging between student and mentor
7. [ ] Availability toggle persists
8. [ ] Mobile responsive on 320px+ widths

### Nice to Have:
- [ ] Smooth page transitions
- [ ] Loading spinners appear
- [ ] Error messages are helpful
- [ ] Toast notifications for success
- [ ] Form validation feedback

---

## 📝 Notes

- **Student fields**: Full Name, Skills, Target Role, Target Companies, Bio
- **Alumni fields**: Full Name, Job Title, Company, Years of Experience, Skills, Bio, Expertise, Availability
- **Key difference**: No job experience fields for students, full professional info for alumni
- **Visuals**: Premium gradients, smooth transitions, color-coded information

---

## 🔗 Important URLs

| Page | URL |
|------|-----|
| Homepage | `/` |
| Login | `/auth/login` |
| Role Selection | `/auth/role` |
| Profile Setup | `/profile/setup` |
| Student Dashboard | `/student/dashboard` |
| Alumni Dashboard | `/mentor/dashboard` |
| Alumni Profile | `/mentor/profile` |
| Student Inbox | `/student/inbox` |
| Mentor Inbox | `/mentor/inbox` |

---

Last Updated: February 8, 2026

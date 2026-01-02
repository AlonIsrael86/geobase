# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

GEOBase is a GEO (Generative Engine Optimization) content management platform for SEO agencies. The system allows businesses to collect real questions and answers from clients, organize them by categories, and export for content creation. AI-powered suggestions help generate relevant Q&A pairs.

**Live URL:** https://geobase.justintime.co.il
**Repository:** https://github.com/AlonIsrael86/geobase

**Target users:** 
- **Clients** - Business owners who input Q&A about their business
- **Agency (Just In Time)** - Manages multiple clients, creates GEO content

## Development Commands

```bash
# Install dependencies
npm install

# Run development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Database commands (Prisma + Neon PostgreSQL)
npx prisma generate        # Generate Prisma Client after schema changes
npx prisma db push         # Push schema changes to database
npx prisma studio          # Open Prisma Studio GUI
npx prisma migrate dev     # Create and apply migrations

# Deployment (Vercel)
vercel --prod              # Deploy to production
Architecture Overview
Tech Stack
Framework: Next.js 14 (App Router, RSC)
Database: Neon PostgreSQL via Prisma ORM
Authentication: Clerk (multi-tenant with User → Client relationship)
AI: Google Gemini API (gemini-2.0-flash) for question/answer suggestions
UI: shadcn/ui components, Tailwind CSS, Radix UI primitives
Styling: RTL support (Hebrew), Heebo font, dark theme (Just In Time branding)
Animation: Framer Motion
Data Export: xlsx library
Analytics: Google Analytics 4 (G-0HCYPYX3LJ)
Deployment: Vercel
Current Features (✅ Implemented)
Q&A Management

Add questions and answers via form
Category-based organization
Status tracking (new → in_article → published)
View, edit, delete submissions
Bulk selection and actions
AI Suggestions (Gemini)

Suggest similar questions based on input
Generate answer suggestions for questions
Category-aware suggestions
Import/Export

Import from Excel, CSV, Google Sheets
Export all submissions to Excel
Download template file
Authentication & Multi-tenancy

Clerk authentication (Hebrew localized)
Each user belongs to a Client
Data isolated per client
SEO & Analytics

Full meta tags and Open Graph
Schema.org markup (Organization, WebSite, SoftwareApplication)
Sitemap and robots.txt
GA4 tracking
UI/UX

Full RTL Hebrew interface
Mobile-responsive design
Dark theme with Just In Time branding
All modals properly styled with single X button
Planned Features (🟡 In Development)
Knowledge Base

Modal for client to paste business context/information
Gemini uses this context for more accurate suggestions
Questions cannot be added until context is provided
Notice already shown in UI: "בקרוב: התשובות יותאמו אוטומטית לעסק שלך"
Admin Dashboard

Agency view of all clients' Q&A
Filter by client, category, status
Centralized management
Audio Transcription (Requested)

Upload audio files (mp3, wav, m4a)
Automatic transcription (Whisper API)
AI extracts Q&A from transcription
Quality scoring (20%-100%)
Edit before saving
Token counting (1 minute = 10 tokens)
Article Builder

Create GEO articles from Q&A pairs
Drag-and-drop ordering
(On demand)
WordPress Publishing

Direct publish to client WordPress
(On demand)
Data Architecture
Multi-tenant structure:

User (clerkId) → Client → Categories, Submissions, KnowledgeFiles, AISuggestions
Key models (Prisma):

model User {
  id        String   @id @default(cuid())
  clerkId   String   @unique
  email     String
  name      String?
  role      String   @default("user")
  client    Client   @relation(fields: [clientId], references: [id])
  clientId  String
}

model Client {
  id              String          @id @default(cuid())
  name            String
  users           User[]
  categories      Category[]
  submissions     Submission[]
  knowledgeFiles  KnowledgeFile[]
  aiSuggestions   AISuggestion[]
}

model Submission {
  id         String   @id @default(cuid())
  question   String
  answer     String
  category   String
  status     String   @default("new")  // new, in_article, published
  source     String?
  wordCount  Int
  client     Client   @relation(fields: [clientId], references: [id])
  clientId   String
  createdAt  DateTime @default(now())
}

model Category {
  id        String   @id @default(cuid())
  name      String
  client    Client   @relation(fields: [clientId], references: [id])
  clientId  String
}
API Routes
Route	Method	Description
/api/submissions	GET	Fetch all submissions for current client
/api/submissions	POST	Create new submission
/api/submissions?id=X	DELETE	Delete single submission
/api/submissions?ids=X,Y,Z	DELETE	Bulk delete submissions
/api/submissions/bulk	POST	Import multiple submissions
/api/categories	GET	Fetch categories for current client
/api/categories	POST	Create new category
/api/categories?id=X	DELETE	Delete category
/api/stats	GET	Fetch dashboard statistics
/api/suggest-questions	POST	Generate 3 similar questions (Gemini)
/api/suggest-answer	POST	Generate answer suggestion (Gemini)
Page Structure
Path	Description	Auth Required
/	Landing page with features, contact form	No
/dashboard	Main control center with stats, table, actions	Yes
/submit	Form to submit Q&A pairs	Yes
/sign-in	Clerk sign-in	No
/sign-up	Clerk sign-up	No
/articles/[id]	Article editor (planned)	Yes
Component Organization
src/components/
├── ui/              # shadcn/ui base components
├── dashboard/       # Dashboard components
│   ├── stats-cards.tsx
│   ├── submissions-table.tsx
│   ├── article-list.tsx
│   ├── view-submission-modal.tsx
│   ├── view-all-questions-modal.tsx
│   ├── floating-action-bar.tsx
│   ├── ai-suggestions.tsx
│   ├── import-modal.tsx
│   ├── category-management-modal.tsx
│   ├── knowledge-base-modal.tsx
│   └── premium-upsell-modal.tsx
├── articles/        # Article editor components
└── publish/         # Publishing components
Critical Implementation Details
RTL (Right-to-Left) Support
The entire UI is RTL-optimized for Hebrew:

Root layout: dir="rtl" and lang="he"
Logo/title on right, action buttons on left
Icons appear after text (e.g., "הוסף שאלה +")
Numbers display in LTR (use ltr-nums class)
Close buttons (X) on left side of modals
Checkbox column is first (right side of table)
Multi-tenancy Rules
All database operations MUST:

Call getCurrentUserWithClient() to get authenticated user
Filter queries by clientId: user.clientId
Never expose data across clients
AI Integration (Gemini)
Copy// Model configuration
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// All prompts in Hebrew
// Returns structured JSON, not raw text
// Knowledge Base context will be injected into prompts (future)
Status System
Submission statuses:

new - Blue badge - Awaiting processing
in_article - Purple badge - Assigned to article
published - Green badge - Published
Word Count Validation
Submit form color feedback:

🔴 Red (> 200 words): Too long
🟡 Yellow (< 100 words): Warning
🟢 Green (100-200 words): Optimal
Environment Variables
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://..."

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI (Google Gemini)
GEMINI_API_KEY="..."

# Analytics (GA4)
# Hardcoded in layout.tsx: G-0HCYPYX3LJ
Styling System
Color Scheme (Just In Time Branding)
Copy--primary: hsl(142, 76%, 46%)     /* Bright green */
--background: hsl(210, 50%, 8%)   /* Dark blue */
--card: hsl(210, 45%, 11%)        /* Card background */
--border: hsl(210, 35%, 18%)      /* Subtle borders */
Mobile-First Design
Action buttons stack vertically below 768px
Stats cards full-width on mobile
Table horizontal scroll
Modals full-screen on mobile
Minimum 44px touch targets
Default Categories
Seeded for new clients:

קורס סייבר (Cyber course)
קורס Data (Data course)
קורס פיתוח (Development course)
כללי (General)
מחירים ותשלומים (Pricing and payments)
השמה ותעסוקה (Placement and employment)
ESLint Configuration
Copy{
  "extends": "next/core-web-vitals",
  "rules": {
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/no-unescaped-entities": "off"
  }
}
Development Notes
All text in Hebrew unless technical terms
Maintain RTL consistency in new components
Always scope to clientId in database queries
Test on mobile - many users access via phone
Use shadcn/ui patterns for consistency
Clerk props: Use forceRedirectUrl (not afterSignInUrl)
Git Workflow
Copy# Standard deploy flow
npm run build
git add .
git commit -m "Description"
git push origin main
vercel --prod
Support
Developer: Alon (Just In Time)
Email: alon.justintime@gmail.com
Phone: 050-787-7165

This updated CLAUDE.md reflects the current state of the app, including all completed features, planned features (Knowledge Base, Admin Dashboard, Audio Transcription), and the technical details needed for future development.
# AFU Portal — Claude Code Instructions

## Core Principles

When I say 'just make it work' or 'fix it', focus on the simplest path to a working state. Do not refactor, decompose, or suggest architectural changes unless explicitly asked. Prioritize visible, testable results over code quality.

## Workflow

After completing a task, move to the next item in the plan autonomously. Do not ask 'what's next?' if there is a plan, todo list, or sprint backlog already defined. Just continue.

## Deployment Checklist

Always verify environment variables (especially NEXTAUTH_URL, DATABASE_URL, Supabase keys) match the deployment target before pushing or deploying. Run a quick env var check against Vercel/hosting config.

## Code Conventions

This is a TypeScript/Next.js project. When passing data from server components to client components, always serialize objects to plain JSON first (convert Dates, Decimals, BigInts). Never pass raw database objects to client components.

- Brand colors: green #5DB347, navy #1B2A4A
- Icons: lucide-react only (no heroicons, react-icons, etc.)
- No emojis in code or UI
- All pages use 'use client' with Supabase client-side fetching
- Root layout provides SiteNavbar and SiteFooter — pages should NOT import their own
- 20 African countries (not 9)

## Session Management

When context window is getting large, proactively summarize progress and create a handoff document before hitting limits. Save current state to a HANDOFF.md file in the repo.

# Deploy Skill
1. Run `npm run build` and fix any TypeScript errors
2. Check all client components don't receive raw Prisma objects (serialize Dates/Decimals)
3. Verify .env.local matches Vercel env vars (especially NEXTAUTH_URL, DATABASE_URL)
4. Run `vercel --prod` and verify deployment URL returns 200
5. Save deployment status to DEPLOY_LOG.md

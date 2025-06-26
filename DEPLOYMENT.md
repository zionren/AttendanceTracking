# Deployment to Vercel

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create a Vercel account at https://vercel.com

## Environment Variables
Before deploying, you need to set up environment variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variables:

```
DATABASE_URL=postgresql://postgres.dmsmhcpppomtgzfifvij:Dimate101%!@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
SUPABASE_ANON=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc21oY3BwcG9tdGd6ZmlmdmlqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5MTM3NjQsImV4cCI6MjA2NjQ4OTc2NH0.WvnTerz-QoUA9DodtaKn2P-q1Wt50QrBZYCLAI_kGWk
SUPABASE_KEY=https://dmsmhcpppomtgzfifvij.supabase.co
NODE_ENV=production
```

## Deployment Steps

### Option 1: Using Vercel CLI
1. Login to Vercel: `vercel login`
2. Deploy: `vercel`
3. Follow the prompts

### Option 2: Using Git Integration
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy on every push

## Project Structure for Vercel
- `/api/index.js` - Main serverless function
- `/public/` - Static files
- `/routes/` - API routes
- `/database/` - Database schema
- `vercel.json` - Vercel configuration

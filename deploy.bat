@echo off
echo Deploying to Vercel...
echo.
echo Make sure you have:
echo 1. Logged into Vercel CLI (vercel login)
echo 2. Set environment variables in Vercel dashboard
echo.
echo Starting deployment...
vercel --prod
echo.
echo Deployment complete!

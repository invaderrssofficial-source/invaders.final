# Deployment Guide

## Architecture Overview

**Vercel** (Frontend + API) + **Supabase** (Database)

- ✅ **Vercel** hosts:
  - Web app (Expo web build)
  - API endpoints (/api/trpc/*)
- ✅ **Supabase** provides:
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication (if needed)
  - Row Level Security

This guide will walk you through deploying your complete app to Vercel with Supabase as the database.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed (optional, but recommended)
3. Your Supabase project set up with the required tables
4. All environment variables ready

## Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

## Step 2: Prepare Your Project

Your project is already configured with:
- ✅ `vercel.json` - Builds Expo web app + API functions
- ✅ `api/trpc/[...trpc].ts` - API handler
- ✅ Backend code in `backend/` folder
- ✅ CORS headers configured
- ✅ Supabase integration in `backend/trpc/supabase.ts`

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended for first-time)

1. Go to https://vercel.com/new
2. Import your Git repository (GitHub, GitLab, or Bitbucket)
3. Configure your project:
   - **Framework Preset**: Other
   - **Build Command**: Will use the one from vercel.json (`npx expo export -p web`)
   - **Output Directory**: `dist` (configured in vercel.json)
   - **Install Command**: `npm install` or `bun install`

4. Add Environment Variables (click "Environment Variables"):
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

5. Click **Deploy**

### Option B: Deploy via CLI

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Navigate to your project directory:
   ```bash
   cd /path/to/your/project
   ```

3. Deploy to preview:
   ```bash
   vercel
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

5. Add environment variables via CLI:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add EXPO_PUBLIC_SUPABASE_URL
   vercel env add EXPO_PUBLIC_SUPABASE_ANON_KEY
   ```

   When prompted, select "Production", "Preview", and "Development" for each variable.

## Step 4: Configure Environment Variables

You need to set these environment variables in Vercel:

| Variable | Description | Where to find |
|----------|-------------|---------------|
| `SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret) | Supabase Dashboard → Settings → API |
| `EXPO_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Anonymous key (public) | Supabase Dashboard → Settings → API |

### How to add environment variables:

1. Go to your project on Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable:
   - Enter the **Key** (e.g., `SUPABASE_URL`)
   - Enter the **Value** (e.g., `https://xxx.supabase.co`)
   - Select environments: **Production**, **Preview**, **Development**
   - Click **Save**

## Step 5: Test Your Deployment

After deployment, you'll get a URL like `https://your-project.vercel.app`

### Test the Web App:

1. Visit `https://your-project.vercel.app`
2. You should see your React Native web app
3. All features should work (it fetches data from the API on the same domain)

### Test API endpoints:

### 1. Test Heroes endpoint:
```bash
curl https://your-project.vercel.app/api/trpc/heroes.getAll
```

Expected response:
```json
{
  "result": {
    "data": [
      {
        "id": "...",
        "name": "John Smith",
        "position": "Forward",
        "number": "10",
        "image": "..."
      }
    ]
  }
}
```

### 2. Test Merch endpoint:
```bash
curl https://your-project.vercel.app/api/trpc/merch.getAll
```

### 3. Test Orders endpoint:
```bash
curl https://your-project.vercel.app/api/trpc/orders.getAll
```

## Step 6: Update Mobile App to Use Production API

For the **mobile app** (iOS/Android), update the API URL to point to your Vercel deployment:

### Option A: Using Environment Variable (Recommended)

1. Add to your local `.env` or set in Expo:
   ```
   EXPO_PUBLIC_API_URL=https://your-project.vercel.app/api/trpc
   ```

2. Your `lib/trpc.ts` should already handle this

### Option B: Direct Update

Update `lib/trpc.ts`:
```typescript
const API_URL = __DEV__ 
  ? 'http://localhost:3000/api/trpc' 
  : 'https://your-project.vercel.app/api/trpc';
```

**Note**: The web app automatically uses relative URLs (`/api/trpc`), so it works without changes.

## Troubleshooting

### Issue: "500 Internal Server Error"

**Solution**: Check the Vercel function logs:
1. Go to your project on Vercel
2. Click **Deployments**
3. Click on the latest deployment
4. Click **Functions** tab
5. Click on the function that failed
6. Check the logs for errors

Common causes:
- Missing environment variables
- Invalid Supabase credentials
- Database connection issues

### Issue: "CORS Error"

**Solution**: CORS headers are already configured in your `api/trpc/[...trpc].ts` and `vercel.json`. If you still get CORS errors:

1. Check that the request includes proper headers
2. Verify your Vercel deployment has the latest code
3. Clear browser cache

### Issue: "Function Timeout"

**Solution**: The function timeout is set to 25 seconds in `vercel.json`. If you need more:
1. Upgrade to Vercel Pro plan (60s timeout)
2. Optimize your database queries
3. Add indexes to your Supabase tables

### Issue: Environment variables not working

**Solution**:
1. Ensure variables are added to the correct environment (Production/Preview/Development)
2. After adding variables, **redeploy** your project:
   - Go to **Deployments** → Click the three dots → **Redeploy**
3. Check variable names are exact (case-sensitive)

## Continuous Deployment

Once connected to Git:

1. Push to your repository
2. Vercel automatically deploys:
   - **Production**: Deploys from `main` or `master` branch
   - **Preview**: Deploys from other branches or pull requests

## Custom Domain (Optional)

1. Go to your project on Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain
4. Update your DNS records as instructed
5. Wait for DNS propagation (can take up to 48 hours)

## Monitoring

Monitor your API:
1. **Analytics**: Vercel Dashboard → Analytics
2. **Logs**: Vercel Dashboard → Deployments → [Latest] → Functions
3. **Performance**: Check response times and error rates

## Production Checklist

Before going live:

- [ ] All environment variables are set in Vercel
- [ ] Web app loads at `https://your-project.vercel.app`
- [ ] Test all API endpoints work
- [ ] Mobile app points to production API URL
- [ ] Supabase Row Level Security (RLS) is configured
- [ ] Database has proper indexes for performance
- [ ] API rate limiting is considered (if needed)
- [ ] Error logging/monitoring is set up
- [ ] Test on real devices (iOS & Android)
- [ ] Test web app on different browsers
- [ ] Monitor for first 24-48 hours after launch

## Support

- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- tRPC Documentation: https://trpc.io/docs

## Quick Commands Reference

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Remove deployment
vercel rm [deployment-url]

# Link local project to Vercel project
vercel link

# Pull environment variables
vercel env pull
```

---

**Your Deployment URLs:**

- **Web App**: `https://your-project.vercel.app`
- **API Base**: `https://your-project.vercel.app/api/trpc`
- **Heroes**: `https://your-project.vercel.app/api/trpc/heroes.getAll`
- **Merch**: `https://your-project.vercel.app/api/trpc/merch.getAll`
- **Orders**: `https://your-project.vercel.app/api/trpc/orders.getAll`

Replace `your-project.vercel.app` with your actual Vercel deployment URL.

## Summary

✅ **Vercel** hosts everything (web app + API)
✅ **Supabase** handles all data storage
✅ Web app works at the root URL
✅ API works at `/api/trpc`
✅ Mobile apps connect to the same API

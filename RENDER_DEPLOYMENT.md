# Wilds Aura — Render.com Deployment Guide

Render is the easiest way to deploy Node.js apps with built-in PostgreSQL database. This guide covers everything.

---

## What You Get (Free Tier)

- ✅ Free Node.js hosting
- ✅ Free PostgreSQL database
- ✅ Free SSL/HTTPS
- ✅ Automatic deployments from GitHub
- ✅ Custom domain support

**Limitations:**
- App spins down after 15 minutes of inactivity (wakes up on first request)
- 400 MB storage (enough for small photo gallery)

---

## Prerequisites

- ✅ Render account (https://render.com - sign up with GitHub)
- ✅ GitHub account with `wilds-aura` repository
- ✅ Custom domain: wildsaura.com (optional)

---

## Step 1: Prepare Your GitHub Repository

Your code should already be on GitHub. If not:

### Export from Manus to GitHub

1. Go to your Manus project **Management UI**
2. Click **Settings** → **GitHub**
3. Click **Export to GitHub**
4. Select your GitHub account
5. Enter repository name: `wilds-aura`
6. Click **Export**
7. Wait for completion

### Verify Repository

- Visit https://github.com/YOUR_USERNAME/wilds-aura
- You should see all your code there

---

## Step 2: Deploy to Render

### 1. Login to Render

- Go to https://render.com
- Click **Sign up with GitHub**
- Authorize Render

### 2. Create New Web Service

1. Click **+ New** → **Web Service**
2. Select your `wilds-aura` repository
3. Click **Connect**

### 3. Configure Deployment

Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | wilds-aura |
| **Environment** | Node |
| **Region** | Singapore (closest to you) |
| **Branch** | main |
| **Build Command** | `pnpm build` |
| **Start Command** | `node dist/index.js` |
| **Publish Directory** | `dist/public` |

Click **Create Web Service**

### 4. Add Environment Variables

While deployment is running, add environment variables:

1. Go to **Environment** tab
2. Add these variables:

```
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=Wilds Aura
VITE_APP_LOGO=https://d2xsxph8kpxj0f.cloudfront.net/310519663405254145/XVj2P2ZP8typMp4sb8ShKr/wildsaura-logo-black-bg-QTJLVvTLmD697CTGQqYF2Q.webp
```

**For Manus OAuth (optional, add later if needed):**
```
VITE_APP_ID=your-app-id
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
OAUTH_SERVER_URL=https://api.manus.im
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
```

3. Click **Save Changes**

### 5. Add PostgreSQL Database

1. Click **+ New** → **PostgreSQL**
2. Name it: `wilds-aura-db`
3. Click **Create Database**

Render will automatically:
- Create the database
- Generate connection string
- Add `DATABASE_URL` environment variable

### 6. Wait for Deployment

- Render will build and deploy your app
- Takes 3-5 minutes
- You'll see a public URL: `https://wilds-aura.onrender.com`

---

## Step 3: Setup Database Schema

Your app uses MySQL schema, but Render PostgreSQL is different. We need to migrate:

### Option A: Use Render Shell (Easiest)

1. In Render dashboard, go to your **Web Service**
2. Click **Shell** tab
3. Run these commands:

```bash
# Run migrations
pnpm db:push

# Or manually create tables
psql $DATABASE_URL < drizzle/migrations/0001_mysterious_vanisher.sql
```

### Option B: Use Local Machine

```bash
# Set environment variable
export DATABASE_URL="your-render-postgres-url"

# Run migrations
pnpm db:push
```

Get the `DATABASE_URL` from Render PostgreSQL service details.

---

## Step 4: Connect Custom Domain (Optional)

### 1. In Render Dashboard

1. Go to your Web Service
2. Click **Settings** → **Custom Domains**
3. Click **Add Custom Domain**
4. Enter: `wildsaura.com`
5. Render shows DNS records

### 2. Update DNS at Namecheap

1. Login to Namecheap
2. Go to **Domain List** → **wildsaura.com** → **Manage**
3. Click **Advanced DNS**
4. Add Render's DNS records:
   - Type: CNAME
   - Host: www
   - Value: (from Render)
5. Save

### 3. Verify

- Visit `https://wildsaura.com`
- Should load your app

---

## Step 5: Test Everything

### Homepage
- [ ] Visit `https://wilds-aura.onrender.com`
- [ ] Should load without errors

### Admin Panel
- [ ] Go to `/admin`
- [ ] Should show "Access Denied" (need login)

### Gallery
- [ ] Scroll through gallery
- [ ] Check if photos load (might be empty initially)

### Upload Photo (if logged in)
- [ ] Login to admin panel
- [ ] Try uploading a test photo
- [ ] Check if it appears in gallery

### Download
- [ ] Try downloading a photo
- [ ] Should have watermark

---

## Troubleshooting

### App won't start

**Check logs:**
1. Go to Render dashboard
2. Click **Logs** tab
3. Look for error messages

**Common issues:**
- Missing environment variables
- Database connection failed
- Build command failed

### Database connection error

```
Error: connect ECONNREFUSED
```

**Fix:**
1. Verify `DATABASE_URL` is set
2. Check PostgreSQL service is running
3. Run migrations: `pnpm db:push`

### Photos not loading

- Check if S3 URLs are correct
- Verify CORS settings
- Check browser console for errors

### Slow performance

- Render free tier spins down after 15 minutes
- First request takes 30 seconds to wake up
- Upgrade to paid tier for always-on

---

## Monitoring

### View Logs

1. Render dashboard → **Logs** tab
2. Real-time logs of your app
3. Useful for debugging

### Metrics

1. Render dashboard → **Metrics** tab
2. CPU, Memory, Network usage
3. Helps identify performance issues

---

## Upgrading (When Needed)

### From Free to Paid

1. Render dashboard → **Settings**
2. Click **Change Plan**
3. Select paid tier ($7-12/month)

**Benefits:**
- Always-on (no spin-down)
- More storage
- Better performance
- Priority support

---

## Next Steps

1. **Deploy to Render** (follow steps above)
2. **Test everything** works
3. **Upload photos** to populate gallery
4. **Setup custom domain** (optional)
5. **Later:** Migrate to AWS when ready

---

## Cost Breakdown

| Service | Free Tier | Paid |
|---------|-----------|------|
| **Render Web** | Free | $7/month |
| **Render PostgreSQL** | Free | Included |
| **Domain (Namecheap)** | - | $8.88/year |
| **Total** | Free | ~$16/month |

---

## Support

- **Render Docs:** https://render.com/docs
- **Render Support:** https://render.com/support
- **PostgreSQL Docs:** https://www.postgresql.org/docs/

---

## Quick Reference

| What | Where |
|------|-------|
| Render Dashboard | https://dashboard.render.com |
| Your App URL | https://wilds-aura.onrender.com |
| Custom Domain | wildsaura.com |
| Admin Panel | /admin |
| Database | PostgreSQL (Render) |
| Logs | Render Dashboard → Logs |

---

**Estimated time:** 10-15 minutes
**Difficulty:** Easy ✅

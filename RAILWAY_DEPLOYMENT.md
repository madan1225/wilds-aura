# Wilds Aura — Railway.app Deployment Guide

Railway.app is the easiest way to deploy Node.js apps. This guide will take you through the process step-by-step.

---

## Prerequisites

- ✅ GitHub account (you have this)
- ✅ Railway account (https://railway.app - sign up with GitHub)
- ✅ Custom domain: wildsaura.com (optional, can add later)

---

## Step 1: Export Code to GitHub

Since your code is currently in Manus, we need to export it to GitHub first.

### Option A: Export from Manus UI (Easiest)

1. Go to your Manus project **Management UI**
2. Click **Settings** → **GitHub**
3. Select your GitHub account
4. Enter repository name: `wilds-aura`
5. Click **Export**
6. Wait for export to complete

### Option B: Manual Push (If Option A doesn't work)

```bash
# Clone your current repo
git clone s3://vida-prod-gitrepo/webdev-git/310519663405254145/XVj2P2ZP8typMp4sb8ShKr wilds-aura-temp

# Add GitHub remote
cd wilds-aura-temp
git remote add github https://github.com/YOUR_USERNAME/wilds-aura.git
git branch -M main
git push -u github main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## Step 2: Deploy to Railway

### 1. Login to Railway

- Go to https://railway.app
- Click **Login with GitHub**
- Authorize Railway to access your GitHub

### 2. Create New Project

- Click **+ New Project**
- Select **Deploy from GitHub repo**
- Find and select `wilds-aura` repository
- Click **Deploy**

### 3. Configure Environment Variables

Railway will ask for environment variables. Add these:

```
DATABASE_URL=mysql://wildocgs_wildsaura_db:Daisuki@25@your-mysql-host/wildocgs_wildsaura_db
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=Wilds Aura
VITE_APP_LOGO=https://d2xsxph8kpxj0f.cloudfront.net/310519663405254145/XVj2P2ZP8typMp4sb8ShKr/wildsaura-logo-black-bg-QTJLVvTLmD697CTGQqYF2Q.webp
```

**Note:** For DATABASE_URL, you have two options:

**Option 1: Use Namecheap MySQL (current)**
```
DATABASE_URL=mysql://wildocgs_wildsaura_db:Daisuki@25@your-namecheap-mysql-host/wildocgs_wildsaura_db
```

**Option 2: Use Railway PostgreSQL (recommended)**
- Railway will offer to create a PostgreSQL database
- Click **Add Database** → **PostgreSQL**
- Railway will auto-generate DATABASE_URL
- You'll need to run migrations on the new database

### 4. Add Build & Start Commands

In Railway project settings:

- **Build Command:** `pnpm build`
- **Start Command:** `node dist/index.js`
- **Node Version:** 24.13.0

### 5. Deploy

- Click **Deploy**
- Wait 3-5 minutes for deployment
- Railway will give you a public URL (e.g., `wilds-aura-production.up.railway.app`)

---

## Step 3: Setup Database (If Using Railway PostgreSQL)

If you chose Railway PostgreSQL:

1. In Railway project, click **PostgreSQL** service
2. Copy the connection string
3. Run migrations:
   ```bash
   # From your local machine
   DATABASE_URL="your-railway-postgres-url" pnpm db:push
   ```

---

## Step 4: Connect Custom Domain

### 1. In Railway Dashboard

1. Go to your project
2. Click **Settings** → **Domains**
3. Click **+ Add Custom Domain**
4. Enter: `wildsaura.com`
5. Railway will show DNS records to add

### 2. Update DNS at Namecheap

1. Login to Namecheap
2. Go to **Domain List** → **wildsaura.com** → **Manage**
3. Click **Advanced DNS**
4. Add the DNS records Railway provided:
   - Type: CNAME
   - Host: www (or @)
   - Value: (Railway provided value)
5. Save changes
6. Wait 5-10 minutes for DNS propagation

### 3. Verify

- Visit `https://wildsaura.com`
- Should load your Wilds Aura website

---

## Step 5: Test Everything

1. **Homepage loads:** ✅
2. **Admin panel accessible:** Go to `/admin`
3. **Upload a test photo:** Try uploading from admin panel
4. **Download with watermark:** Test photo download
5. **Like/comment as visitor:** Test visitor features

---

## Monitoring & Logs

### View Logs in Railway

1. Go to Railway project
2. Click **Deployments**
3. Click latest deployment
4. View **Logs** tab
5. Look for errors

### Common Issues

**App crashes on startup:**
- Check DATABASE_URL is correct
- Verify all environment variables are set
- Check logs for specific error

**Database connection failed:**
- Verify DATABASE_URL format
- Check if database server is accessible
- Ensure firewall allows Railway IP

**Domain not working:**
- Wait 24 hours for DNS propagation
- Verify DNS records in Namecheap
- Check Railway domain settings

---

## Cost Breakdown

**Railway Free Tier:**
- $5/month credit (usually covers small apps)
- After that: ~$10-20/month depending on usage

**Namecheap:**
- Domain: ~$8.88/year
- No hosting needed (Railway handles it)

**Total:** ~$10-20/month (very affordable!)

---

## Next Steps After Deployment

1. **Setup email notifications** (optional)
2. **Monitor performance** in Railway dashboard
3. **Backup database** regularly
4. **Update photos** regularly via admin panel

---

## Support

- **Railway Docs:** https://docs.railway.app
- **Railway Support:** https://railway.app/support
- **Namecheap Support:** https://www.namecheap.com/support/

---

## Quick Reference

| What | Where |
|------|-------|
| Railway Dashboard | https://railway.app |
| Your Project URL | (provided by Railway) |
| Custom Domain | wildsaura.com |
| Admin Panel | /admin |
| Database | PostgreSQL (Railway) or MySQL (Namecheap) |

---

**Estimated time:** 15-20 minutes (excluding DNS propagation)

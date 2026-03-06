# Wilds Aura — Namecheap cPanel Deployment Checklist

## Pre-Deployment ✓

- [x] Production build created (`dist/` folder ready)
- [x] Database credentials provided
- [x] Domain name: wildsaura.com
- [x] Node.js v24.13.0 available on cPanel

---

## Step-by-Step Deployment

### 1. Database Setup (5 minutes)

- [ ] Login to Namecheap cPanel
- [ ] Go to **phpMyAdmin**
- [ ] Select database: `wildocgs_wildsaura_db`
- [ ] Click **Import** tab
- [ ] Upload file: `drizzle/migrations/0001_mysterious_vanisher.sql`
- [ ] Click **Import** button
- [ ] Verify tables created (users, posts, likes, comments)

### 2. Upload Application Files (10 minutes)

- [ ] Connect via FTP/SFTP to Namecheap
- [ ] Navigate to `public_html/` folder
- [ ] Create folder: `wilds-aura`
- [ ] Upload these files/folders:
  - `dist/` (entire folder)
  - `package.json`
  - `pnpm-lock.yaml`

### 3. Create Node.js App in cPanel (5 minutes)

- [ ] Go to cPanel > **Setup Node.js App**
- [ ] Click **Create**
- [ ] Fill in:
  - App name: `wilds-aura`
  - Node version: `24.13.0`
  - App URL: `/`
  - Startup file: `dist/index.js`
  - App root: `/public_html/wilds-aura`
- [ ] Click **Create** button

### 4. Set Environment Variables (5 minutes)

In cPanel Node.js app settings, add:

```
DATABASE_URL=mysql://wildocgs_wildsaura_db:Daisuki@25@localhost/wildocgs_wildsaura_db
NODE_ENV=production
PORT=3000
VITE_APP_TITLE=Wilds Aura
VITE_APP_LOGO=https://d2xsxph8kpxj0f.cloudfront.net/310519663405254145/XVj2P2ZP8typMp4sb8ShKr/wildsaura-logo-black-bg-QTJLVvTLmD697CTGQqYF2Q.webp
```

**Note:** OAuth variables will be configured later if needed.

- [ ] Save environment variables

### 5. Install Dependencies (5 minutes)

- [ ] In cPanel, open **Terminal**
- [ ] Run: `cd public_html/wilds-aura`
- [ ] Run: `npm install --legacy-peer-deps` (or `pnpm install`)
- [ ] Wait for completion

### 6. Bind Domain (5 minutes)

- [ ] In cPanel Node.js app settings, set domain to: `wildsaura.com`
- [ ] Update DNS at Namecheap to point to your cPanel server
- [ ] Wait 5-10 minutes for DNS propagation

### 7. Test Application (5 minutes)

- [ ] Visit: `https://wildsaura.com`
- [ ] Check if homepage loads
- [ ] Check browser console for errors
- [ ] Check cPanel > Node.js App > Logs for server errors

---

## Troubleshooting

### App won't start
```
Check: cPanel > Node.js App > Logs
Look for error messages
Verify DATABASE_URL is correct
```

### Database connection failed
```
Test connection: mysql -u wildocgs_wildsaura_db -p -h localhost wildocgs_wildsaura_db
Enter password: Daisuki@25
```

### Domain not working
```
Check DNS propagation: https://dnschecker.org
Wait 24 hours if recently changed
Verify A record points to cPanel server IP
```

### 502 Bad Gateway
```
App might be crashing
Check Node.js app logs
Verify PORT environment variable is set
```

---

## After Deployment

1. **Test admin panel:**
   - Go to `/admin`
   - Should show "Access Denied" (need to login first)

2. **Setup OAuth (Optional):**
   - If you want login functionality, add Manus OAuth credentials to environment variables

3. **Upload photos:**
   - After login, admin panel will be accessible
   - Start uploading photos and videos

---

## Important Files

- `dist/index.js` — Server startup file
- `dist/public/` — Frontend files
- `package.json` — Dependencies list
- `drizzle/migrations/` — Database schema

---

## Support

**Namecheap Support:** https://www.namecheap.com/support/
**cPanel Documentation:** https://documentation.cpanel.net/

---

## Deployment Package Contents

- `dist/` — Compiled application
- `package.json` — Node dependencies
- `pnpm-lock.yaml` — Dependency lock file
- `drizzle/migrations/` — Database migrations

**Total size:** ~427 KB (compressed)

---

**Estimated total time:** 40-50 minutes (including DNS propagation wait)

# Wilds Aura — Namecheap cPanel Deployment Guide

## Database Setup

Your MySQL database is already created on Namecheap:
- **Database Name:** wildocgs_wildsaura_db
- **Username:** wildocgs_wildsaura_db
- **Password:** Daisuki@25
- **Host:** localhost (or your Namecheap MySQL host)

### Run Database Migrations

1. In cPanel, go to **phpMyAdmin**
2. Select your database `wildocgs_wildsaura_db`
3. Go to **Import** tab
4. Upload the migration file: `drizzle/migrations/0001_mysterious_vanisher.sql`
5. Click **Import**

This will create all required tables (users, posts, likes, comments).

---

## Node.js App Setup in cPanel

### Step 1: Upload Files via FTP/SFTP

1. Connect to your Namecheap FTP using FileZilla or similar
2. Navigate to your public_html folder
3. Upload the entire `dist/` folder (contains compiled backend + frontend)
4. Upload `package.json` and `pnpm-lock.yaml`

### Step 2: Create Node.js App in cPanel

1. Login to cPanel
2. Find **"Setup Node.js App"** (under Software section)
3. Click **"Create"** and fill in:
   - **App name:** wilds-aura
   - **Node version:** 24.13.0
   - **App URL:** / (root)
   - **App startup file:** dist/index.js
   - **App root:** /public_html/wilds-aura (or your app folder)

### Step 3: Set Environment Variables

In cPanel Node.js app settings, add these environment variables:

```
DATABASE_URL=mysql://wildocgs_wildsaura_db:Daisuki@25@localhost/wildocgs_wildsaura_db
NODE_ENV=production
PORT=3000
VITE_APP_ID=<your-manus-app-id>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
JWT_SECRET=<generate-random-string>
OWNER_OPEN_ID=<your-manus-open-id>
OWNER_NAME=Sheekha
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=<your-forge-key>
VITE_FRONTEND_FORGE_API_KEY=<your-frontend-key>
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_APP_TITLE=Wilds Aura
VITE_APP_LOGO=https://d2xsxph8kpxj0f.cloudfront.net/310519663405254145/XVj2P2ZP8typMp4sb8ShKr/wildsaura-logo-black-bg-QTJLVvTLmD697CTGQqYF2Q.webp
```

### Step 5: Install Dependencies

1. In cPanel, go to **Terminal** (if available)
2. Navigate to your app folder: `cd public_html/wilds-aura`
3. Run one of these commands:
   - `npm install --legacy-peer-deps` (recommended for npm)
   - `pnpm install` (if pnpm is available)
4. Wait for installation to complete

### Step 5: Bind Domain

1. In cPanel Node.js app, set the domain to **wildsaura.com**
2. Update DNS records at Namecheap to point to your cPanel server

---

## Troubleshooting

### App won't start
- Check error logs in cPanel > Node.js App > Logs
- Verify DATABASE_URL is correct
- Ensure all environment variables are set

### Database connection error
- Test MySQL connection: `mysql -u wildocgs_wildsaura_db -p -h localhost wildocgs_wildsaura_db`
- Verify credentials are correct

### Port issues
- cPanel assigns a random port; check the Node.js app settings
- Proxy should automatically route requests

---

## File Structure After Upload

```
public_html/wilds-aura/
├── dist/
│   ├── index.js (server)
│   ├── public/ (frontend)
│   │   ├── index.html
│   │   └── assets/
├── package.json
├── pnpm-lock.yaml
```

---

## Next Steps

1. **Test the app:** Visit wildsaura.com
2. **Login:** Use your Manus account to access admin panel
3. **Upload photos:** Go to /admin and start uploading content

---

## Support

For issues with cPanel Node.js deployment, contact Namecheap support.
For app-specific issues, check the error logs in cPanel.

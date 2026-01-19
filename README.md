# Fleet Account Manager

A web app for managing SB (Sound Billing) fleet accounts for Jiffy Lube franchise operations.

## Features

- 🔐 Secure login with Supabase Auth
- 📊 Dashboard with account statistics
- 🔍 Search and filter accounts
- ➕ Add new fleet accounts
- ✏️ Edit account details
- ✓ Mark accounts active/inactive
- 🚨 Review flagged accounts

## Setup

### 1. Prerequisites

- Node.js 18+
- Supabase project with `sb_fleet_accounts` table
- User accounts created in Supabase Auth

### 2. Environment Variables

Create a `.env` file:

```
VITE_SUPABASE_URL=https://yqgboxsfiiqqqvqqjyve.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Install & Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 4. Build for Production

```bash
npm run build
```

Output is in `dist/` folder.

---

## Deployment to Render

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/fleet-account-manager.git
git push -u origin main
```

### 2. Create Render Static Site

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **Static Site**
3. Connect your GitHub repo
4. Configure:
   - **Name:** fleet-account-manager
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
5. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Click **Create Static Site**

### 3. Configure Render for SPA Routing

Add a `_redirects` file to `public/` folder:
```
/*    /index.html   200
```

Or add rewrite rules in Render dashboard.

---

## Supabase Auth Setup

### Create User Accounts

1. Go to Supabase Dashboard → Authentication → Users
2. Click **Add User** → **Create New User**
3. Enter email and password
4. Users: 
   - sporcher@myjiffylube.com
   - gcantrell@myjiffylube.com

### Row Level Security (Optional)

If you want to restrict access to authenticated users only:

```sql
ALTER TABLE sb_fleet_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users full access" ON sb_fleet_accounts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

---

## Usage

### Adding a New Account

1. Click **Accounts** tab
2. Click **+ Add Account**
3. Enter Business Account ID (from POS)
4. Fill in company details
5. Click **Add Account**

### Updating Account Status

1. Search for the account
2. Click **Edit**
3. Use quick buttons: **Mark Active** or **Mark Inactive**
4. Or toggle checkboxes and click **Save Changes**

### Clearing Review Flag

1. Find the flagged account
2. Click **Edit**
3. Uncheck **Needs Review**
4. Click **Save Changes**

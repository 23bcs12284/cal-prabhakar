# 🔐 OAuth Quick Start Reference Card

## The Problem
```
GET /api/auth/signin/google → 500 Internal Server Error
```

## The Root Cause
✗ `auth.ts` was using unconfigured providers
✗ No `.env.local` file with credentials
✗ No NEXTAUTH_SECRET for session encryption

## The Solution (What Was Fixed)
✅ **app/lib/auth.ts** - Now properly configures GitHub and Google providers with environment variables
✅ **.env.local** - Template created with all required variables
✅ Build verified - No TypeScript errors

---

## 📋 SETUP IN 3 STEPS

### Step 1: Generate Secret (2 seconds)
```bash
openssl rand -base64 32
# Copy the output
```

### Step 2: Update .env.local (5 minutes)
```env
# Paste generated secret here:
NEXTAUTH_SECRET=<paste_here>

# Get from GitHub: https://github.com/settings/developers
GITHUB_ID=abc123
GITHUB_SECRET=xyz789

# Get from Google: https://console.cloud.google.com
GOOGLE_CLIENT_ID=abc123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xyz789

# Keep these as-is:
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=file:./dev.db
```

### Step 3: Restart Server (1 second)
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

Then test at: http://localhost:3000

---

## ✅ Verification

| Check | Command | Expected |
|-------|---------|----------|
| Build | `npm run build` | ✓ Compiled successfully |
| Server | `npm run dev` | No errors, runs on 3000 |
| Signin | Visit `/` | Signin buttons appear |
| Click GitHub | `signIn("github")` | Redirects to GitHub |
| Click Google | `signIn("google")` | Redirects to Google |
| Auth callback | After login | Redirect to `/dashboard` |

---

## 🔗 OAuth Provider Setup URLs

### GitHub
**URL:** https://github.com/settings/developers
- Click "New OAuth App"
- **Application name:** CalPrabhakar
- **Homepage URL:** http://localhost:3000
- **Authorization callback URL:** http://localhost:3000/api/auth/callback/github
- Copy: Client ID and Secret to .env.local

### Google
**URL:** https://console.cloud.google.com/
- Create OAuth 2.0 Client ID (Web)
- **Authorized redirect URIs:**
  - http://localhost:3000/api/auth/callback/google
- Copy: Client ID and Secret to .env.local

---

## 🚨 If Still Getting 500 Error

### Quick Checks (in order)
1. ✓ `.env.local` exists?
   ```bash
   ls -la .env.local
   ```

2. ✓ Has NEXTAUTH_SECRET?
   ```bash
   grep NEXTAUTH_SECRET .env.local
   ```

3. ✓ Has GitHub credentials?
   ```bash
   grep GITHUB_ID .env.local
   ```

4. ✓ Has Google credentials?
   ```bash
   grep GOOGLE_CLIENT_ID .env.local
   ```

5. ✓ Are values filled in (not placeholder)?
   ```bash
   grep "your_" .env.local  # Should return nothing
   ```

6. ✓ Server restarted after adding .env.local?
   ```bash
   npm run dev
   ```

### Check Server Logs
```bash
# Look for errors like:
# - "NEXTAUTH_SECRET is not defined"
# - "GITHUB_ID is not defined"
# - "Failed to validate OAuth callback"
```

### Check Browser Console (F12)
- Network tab: Check for failed requests
- Console tab: Look for JavaScript errors

---

## 📁 Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `app/lib/auth.ts` | Auth config | ✅ Fixed |
| `app/api/auth/[...nextauth]/route.ts` | Auth routes | ✅ Correct |
| `.env.local` | Credentials | ✅ Created |
| `OAUTH_SETUP_GUIDE.md` | Detailed guide | 📖 Reference |
| `OAUTH_TROUBLESHOOTING.md` | Debug help | 🔧 Reference |

---

## 🎯 Expected Behavior

### Before Fix
```
1. Click "Sign In with Google"
   ↓
2. 500 Error ❌
```

### After Fix
```
1. Click "Sign In with Google"
   ↓
2. Redirect to Google login ✓
   ↓
3. User enters credentials
   ↓
4. Redirect to /dashboard ✓
   ↓
5. User is logged in ✓
```

---

## 🚀 Production Deployment

When deploying to production, update:

```env
# Change to your domain
NEXTAUTH_URL=https://yourdomain.com

# Update GitHub callback URL in provider settings
# Update Google redirect URI in provider settings

# Must be different from local!
NEXTAUTH_SECRET=<new_random_secret>

# Use production database
DATABASE_URL=postgresql://...
```

---

## 📞 Need Help?

1. **Setup issues?** → See `OAUTH_SETUP_GUIDE.md`
2. **Still getting errors?** → See `OAUTH_TROUBLESHOOTING.md`
3. **Code questions?** → Review the fixed `app/lib/auth.ts`

---

**Last Updated:** March 28, 2026
**Status:** ✅ Fixed & Verified

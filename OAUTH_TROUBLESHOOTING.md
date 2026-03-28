# OAuth 500 Error - Complete Troubleshooting Guide

## Quick Diagnosis

### Step 1: Check Server Logs
```bash
npm run dev
# Look for error messages like:
# - "NEXTAUTH_SECRET is not defined"
# - "GITHUB_ID is not defined"
# - "OAuth configuration error"
```

### Step 2: Check Browser Console (F12)
- Go to http://localhost:3000
- Press F12 → Console tab
- Look for JavaScript errors
- Check Network tab for failed requests

### Step 3: Check .env.local File
```bash
# Verify file exists and has content
cat .env.local

# Check for required variables (should not be empty)
grep -E "NEXTAUTH_|GITHUB_|GOOGLE_" .env.local
```

## Common Errors & Solutions

### Error 1: "internal_error" or Generic 500

**Check:**
```bash
# In server logs, look for:
# 1. NEXTAUTH_SECRET not set
# 2. OAuth credentials missing
# 3. Database connection failed

# Verify all required env vars exist:
grep "^NEXTAUTH_SECRET=" .env.local
grep "^GITHUB_ID=" .env.local
grep "^GITHUB_SECRET=" .env.local
grep "^GOOGLE_CLIENT_ID=" .env.local
grep "^GOOGLE_CLIENT_SECRET=" .env.local
```

**Solution:**
- Generate NEXTAUTH_SECRET: `openssl rand -base64 32`
- Update .env.local with all values
- Restart server: `npm run dev`

### Error 2: "Callback validation failed"

**Cause:** Redirect URI doesn't match provider settings

**Fix:**
1. **GitHub:** Check that your OAuth App has exact callback URL:
   - Go to: https://github.com/settings/developers
   - Select your app
   - Verify: "Authorization callback URL" = `http://localhost:3000/api/auth/callback/github`

2. **Google:** Check that your OAuth client has exact redirect URI:
   - Go to: https://console.cloud.google.com/apis/credentials
   - Select your OAuth 2.0 Client
   - Verify: "Authorized redirect URIs" includes `http://localhost:3000/api/auth/callback/google`

### Error 3: "invalid_client" Error

**Cause:** Incorrect Client ID or Secret

**Fix:**
1. Double-check you copied the values correctly (no extra spaces/characters)
2. Verify you're using the right credentials:
   - GitHub: Client ID and Client Secret (not Personal Access Token)
   - Google: Client ID and Client Secret (not API Key)
3. Test by printing to console (temporarily):
   ```bash
   # In .env.local, temporarily add:
   NEXTAUTH_DEBUG=true
   # Restart and check logs for credential values
   ```

### Error 4: WebSocket Error / Connection Refused

**Cause:** NEXTAUTH_SECRET not properly configured

**Fix:**
```bash
# Make sure NEXTAUTH_SECRET is in .env.local:
grep "^NEXTAUTH_SECRET=" .env.local

# Should show something like:
# NEXTAUTH_SECRET=aAbBcCdDeFfGgHhIiJjKkLlMmNnOoPp

# If empty or missing, generate and add:
openssl rand -base64 32
```

### Error 5: "Database connection error"

**Cause:** DATABASE_URL not configured

**Fix (SQLite - Local Development):**
```env
DATABASE_URL=file:./dev.db
```

**Fix (PostgreSQL):**
```env
DATABASE_URL=postgresql://username:password@localhost:5432/calprabhakar
```

Then run migrations:
```bash
npx prisma db push
```

### Error 6: Redirect Loop or Session Not Working

**Cause:** Session configuration or database issue

**Fix:**
1. Verify Prisma models are synced:
   ```bash
   npx prisma db push
   ```

2. Clear browser cookies:
   - DevTools → Application → Cookies → Delete all

3. Clear Next.js cache:
   ```bash
   rm -rf .next
   npm run dev
   ```

## Debugging Workflow

### 1. Enable Debug Mode
Add to .env.local:
```env
NEXTAUTH_DEBUG=true
```

Then check server logs for detailed information.

### 2. Test Each Component Separately

**Test 1: Can you reach the signin page?**
```
Open: http://localhost:3000
Expected: Should show homepage with signin buttons (no 500 error)
```

**Test 2: Can you click the provider button?**
```
Click: "Sign In with GitHub"
Expected: Redirect to GitHub login page
If error: Check GitHub OAuth app configuration
```

**Test 3: Does GitHub/Google accept your credentials?**
```
After entering credentials on provider site
Expected: Redirect back to http://localhost:3000/api/auth/callback/github
If error: Check callback URL in provider settings
```

**Test 4: Is the callback handled correctly?**
```
Check server logs for:
- Authorization code received
- Token exchange successful
- User data retrieved
If error: Check NEXTAUTH_SECRET and session configuration
```

### 3. Verify File Structure
```
app/
├── lib/
│   └── auth.ts           ✅ Must have proper provider config
├── api/
│   └── auth/
│       ├── [...]nextauth]/
│       │   └── route.ts   ✅ Must export handlers
│       └── route.ts       ✅ OAuth exchange route
└── components/
    └── AuthModal.tsx      ✅ Uses signIn()
    
.env.local                 ✅ Must have all credentials
```

### 4. Check Imports in Components

AuthModal.tsx should use:
```typescript
import { signIn } from "@/app/lib/auth";

// In your component:
await signIn("google", { redirectTo: "/dashboard" });
// or
await signIn("github", { redirectTo: "/dashboard" });
```

## Environment Variables Reference

```env
# REQUIRED - Session encryption
NEXTAUTH_SECRET=at_least_32_characters_long_random_string

# REQUIRED - App URL
NEXTAUTH_URL=http://localhost:3000

# REQUIRED - Database
DATABASE_URL=file:./dev.db
# OR
DATABASE_URL=postgresql://user:password@localhost:5432/calprabhakar

# REQUIRED - GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# REQUIRED - Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OPTIONAL - Debugging
NEXTAUTH_DEBUG=true
```

## Testing Checklist

- [ ] .env.local exists and contains all variables
- [ ] All env var values are filled in (not placeholder text)
- [ ] NEXTAUTH_SECRET is at least 32 characters
- [ ] GitHub callback URL matches exactly
- [ ] Google redirect URI matches exactly
- [ ] .next folder deleted
- [ ] npm run dev starts without errors
- [ ] http://localhost:3000 loads without errors
- [ ] Sign in buttons are visible
- [ ] Clicking sign in redirects to provider
- [ ] After authentication, user is logged in
- [ ] Dashboard shows user info
- [ ] No 404, 500, or other errors in browser console

## Still Not Working?

1. **Verify auth.ts is correct:**
   ```bash
   cat app/lib/auth.ts | head -30
   ```

2. **Check that route handler exists:**
   ```bash
   cat app/api/auth/[...nextauth]/route.ts
   ```

3. **Enable maximum debugging:**
   ```env
   NEXTAUTH_DEBUG=true
   NEXTAUTH_VERBOSE=true
   ```

4. **Check for typos in .env.local:**
   ```bash
   # Should show no placeholder values
   grep "your_" .env.local
   ```

5. **Restart everything:**
   ```bash
   # Kill server (Ctrl+C)
   rm -rf node_modules/.cache
   rm -rf .next
   npm run dev
   ```

## Production Checklist

Before deploying to production:

- [ ] Change NEXTAUTH_URL to your domain
- [ ] Use strong, random NEXTAUTH_SECRET
- [ ] Update GitHub callback URL to production domain
- [ ] Update Google redirect URI to production domain
- [ ] Use production database (PostgreSQL recommended)
- [ ] Set all env vars in production platform
- [ ] Remove NEXTAUTH_DEBUG=true
- [ ] Test login flow in production
- [ ] Monitor error logs for issues

## Files to Review

1. ✅ [app/lib/auth.ts](../app/lib/auth.ts) - Main auth configuration
2. ✅ [app/api/auth/[...nextauth]/route.ts](../app/api/auth/[...nextauth]/route.ts) - Route handler
3. ✅ [.env.local](.env.local) - Environment variables
4. ✅ [prisma/schema.prisma](../prisma/schema.prisma) - Database schema

## Additional Resources

- NextAuth.js Docs: https://next-auth.js.org/
- GitHub OAuth: https://github.com/settings/developers
- Google OAuth: https://console.cloud.google.com/
- Prisma Docs: https://www.prisma.io/docs/

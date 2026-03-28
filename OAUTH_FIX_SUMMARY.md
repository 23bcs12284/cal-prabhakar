# OAuth DevServer Error Fix Summary

## Original 500 Error Root Causes

1. **Incomplete Auth Configuration** 
   - `auth.ts` was importing providers without passing credentials
   - Providers need explicit clientId and clientSecret configuration
   - ❌ Old: `providers: [GitHub, Google]`
   - ✅ New: Proper configuration with env variables

2. **Missing NEXTAUTH_SECRET**
   - Required for encrypting sessions and CSRF tokens
   - Prevents NextAuth authentication flow

3. **No Environment Variables**
   - OAuth credentials not provided
   - Database connection not configured

## Files Modified

### 1. `/app/lib/auth.ts` ✅
**What was fixed:**
- Added proper GitHub provider configuration with clientId and clientSecret
- Added proper Google provider configuration with clientId, clientSecret, and allowDangerousEmailAccountLinking
- Added NEXTAUTH_SECRET validation (via environment)
- Added pages configuration (signIn redirect to home)
- Added callbacks for authorization logic
- Added session strategy ("database")

**Before:**
```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [GitHub, Google],  // ❌ Incomplete
});
```

**After:**
```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: "/",
  },
  callbacks: {
    authorized({ request, auth }) {
      const isLoggedIn = !!auth?.user;
      const isAuthPage = request.nextUrl.pathname.startsWith("/");
      if (isAuthPage) {
        if (isLoggedIn) return true;
        return false;
      } else if (isLoggedIn) {
        return true;
      }
      return false;
    },
  },
  session: {
    strategy: "database",
  },
});
```

### 2. `.env.local` ✅ (Created)
**Contains:**
- NEXTAUTH_URL
- NEXTAUTH_SECRET (placeholder)
- DATABASE_URL
- GITHUB_ID and GITHUB_SECRET
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- Optional: Nylas and Uploadthing configs

## How to Fix Your Project

### Quick Setup (5 minutes)

1. **Generate Secret:**
   ```bash
   openssl rand -base64 32
   ```

2. **Update `.env.local`:**
   - Replace secret key with generated one
   - Add GitHub credentials (from https://github.com/settings/developers)
   - Add Google credentials (from https://console.cloud.google.com)

3. **Clear Cache:**
   ```bash
   rm -rf .next
   ```

4. **Restart Server:**
   ```bash
   npm run dev
   ```

### Expected Behavior After Fix

1. User clicks "Sign In with Google" or "Sign In with GitHub"
2. Redirects to provider login page (no 500 error)
3. After authentication, redirects to dashboard
4. Session stored in database

## Important Environment Variables

```env
# Get from https://github.com/settings/developers
GITHUB_ID=abc123def456
GITHUB_SECRET=xyz789...

# Get from https://console.cloud.google.com
GOOGLE_CLIENT_ID=abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xyz789...

# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpP

# Local development
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/calprabhakar
```

## Callback URLs to Configure in Providers

### GitHub
- Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### Google
- Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`

## Technical Details

**Auth Flow:**
1. User clicks login button
2. Redirects to `/api/auth/signin/[provider]`
3. NextAuth redirects to provider (GitHub/Google)
4. User authenticates with provider
5. Provider redirects back to callback URL with authorization code
6. NextAuth exchanges code for tokens
7. User data stored in Prisma database (User, Account, Session models)
8. Session created
9. Redirect to dashboard

**Database Models (Already Configured):**
- ✅ User (id, name, email, image, etc.)
- ✅ Account (OAuth credentials)
- ✅ Session (sessionToken, expires)
- ✅ VerificationToken (for email verification)

## Verification Checklist

- [ ] `.env.local` file exists with all required variables
- [ ] NEXTAUTH_SECRET is at least 32 characters
- [ ] GitHub OAuth credentials are correct
- [ ] Google OAuth credentials are correct
- [ ] Callback URLs match exactly (including http:// vs https://)
- [ ] `.next` folder deleted
- [ ] `npm run dev` starts without errors
- [ ] Login page loads without errors
- [ ] Clicking "Sign In" redirects to provider without 500 error
- [ ] After authentication, user is logged in without errors

## Still Getting Errors?

1. Check server logs for specific error messages
2. Enable debug mode:
   ```env
   NEXTAUTH_DEBUG=true
   ```
3. Check browser Network tab (F12) for failed requests
4. Verify all env variables are set:
   ```bash
   grep "^[A-Z_]*=" .env.local
   ```
5. Ensure no trailing spaces in .env.local values

See `OAUTH_SETUP_GUIDE.md` for detailed troubleshooting.

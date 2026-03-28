# OAuth Setup & Debugging Guide for CalPrabhakar

## Root Causes of 500 Error

1. **Missing OAuth Provider Configuration** 
   - The auth.ts was importing bare providers without client ID/secret configuration
   - Fixed: Now properly configures with environment variables

2. **Missing Environment Variables**
   - NEXTAUTH_SECRET not set (required for session encryption)
   - GITHUB_ID and GITHUB_SECRET not configured
   - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not configured
   - DATABASE_URL may not be correct

3. **Incorrect Provider Configuration**
   - Providers must explicitly receive credentials from environment
   - Redirect URIs must match provider settings exactly

## Step-by-Step Setup

### Step 1: Generate NEXTAUTH_SECRET

Run this command to generate a random secret:

```bash
openssl rand -base64 32
```

Copy the output and replace `your_random_secret_key_here_min_32_chars_12345678901234567890` in .env.local

### Step 2: Setup GitHub OAuth

1. Go to: https://github.com/settings/developers
2. Click "New OAuth App"
3. Fill in the form:
   - **Application name**: CalPrabhakar
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/api/auth/callback/github
4. Copy the "Client ID" and generate "Client Secret"
5. Add to .env.local:
   ```
   GITHUB_ID=your_client_id
   GITHUB_SECRET=your_client_secret
   ```

### Step 3: Setup Google OAuth

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
4. Click "Configure Consent Screen" (if needed)
5. Select Web Application
6. Add Authorized redirect URIs:
   - http://localhost:3000/api/auth/callback/google
7. Copy the Client ID and Client Secret
8. Add to .env.local:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### Step 4: Verify DATABASE_URL

The .env.local expects PostgreSQL. Verify your DATABASE_URL is correct:

```
DATABASE_URL=postgresql://user:password@localhost:5432/calprabhakar
```

Or if using SQLite locally:

```
DATABASE_URL=file:./dev.db
```

### Step 5: Update .next Cache

```bash
rm -rf .next
```

### Step 6: Restart the Server

```bash
npm run dev
```

## Testing OAuth Flow

1. Open http://localhost:3000
2. Click "Sign In" → Google or GitHub
3. You should be redirected to the provider
4. After authentication, you should return to the app without 500 error

## Common Issues & Solutions

### Issue: Still getting 500 error

**Solution:**
1. Check browser console (F12 → Console)
2. Check server terminal for error messages
3. Verify all required env variables are set: `grep -E "^[A-Z_]+=" .env.local`
4. Ensure NEXTAUTH_SECRET is at least 32 characters

### Issue: "Redirect URI mismatch"

**Solution:**
- Check that callback URLs in .env.local match exactly:
  - GitHub: http://localhost:3000/api/auth/callback/github
  - Google: http://localhost:3000/api/auth/callback/google
- Ensure http:// (not https://) for localhost development

### Issue: "invalid_client" error

**Solution:**
- Verify GITHUB_ID/GITHUB_SECRET or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are correct
- Make sure they're not wrapped in quotes in .env.local
- Check for trailing spaces

### Issue: WebSocket errors

**Solution:**
- Usually related to NEXTAUTH_SECRET not being set
- Set NEXTAUTH_SECRET first, then restart

### Issue: "NEXTAUTH_URL not set" error

**Solution:**
- Must set: `NEXTAUTH_URL=http://localhost:3000`
- In production, change to your actual domain

## Files Modified

✅ `/app/lib/auth.ts` - Fixed provider configuration
✅ `.env.local` - Created with template

## Production Deployment

When deploying to production:

1. Change NEXTAUTH_URL to your actual domain:
   ```
   NEXTAUTH_URL=https://yourdomain.com
   ```

2. Use strong NEXTAUTH_SECRET

3. Update GitHub/Google redirect URIs:
   ```
   https://yourdomain.com/api/auth/callback/github
   https://yourdomain.com/api/auth/callback/google
   ```

4. Use production database URL (PostgreSQL recommended)

5. Set environment variables in your hosting platform (Vercel, Railway, etc.)

## Debugging

If still experiencing issues, add this to .env.local temporarily:

```
NEXTAUTH_DEBUG=true
```

Then check server logs for detailed NextAuth debug output.

Clear the debug mode in production!

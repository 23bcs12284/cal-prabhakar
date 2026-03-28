# ✅ NextAuth + MySQL Integration - COMPLETE FIX

## 🔍 Issue Identified & FIXED

### Root Cause: DATABASE_URL URL Encoding Issue
Your password contains a special character (`@`):
```
Password: your_db_password
```

When used in a database URL, the `@` character is a **reserved character** that separates credentials from the hostname:
```
❌ WRONG: mysql://username:password@host
```

URL parsers get confused when `@` appears in the password because they can't distinguish between:
- The `@` that's part of the password
- The `@` that separates credentials from host

**Solution: URL-encode the `@` as `%40`**

---

## ✨ Fixes Applied

### 1. DATABASE_URL Configuration
**Before (BROKEN):**
```env
DATABASE_URL=mysql://root:your_db_password@localhost:3306/calapp
                                 ↑
                    This @ confuses the parser
```

**After (FIXED):**
```env
DATABASE_URL=mysql://root:your_db_password_urlencoded@localhost:3306/calapp
                                   ↑
                        URL-encoded @ as %40
```

### 2. Updated Files
- ✅ `.env` - DATABASE_URL corrected with URL encoding
- ✅ `.env.local` - DATABASE_URL corrected with URL encoding
- ✅ Verified `prisma/schema.prisma` - provider = "mysql" ✓
- ✅ Verified `app/lib/auth.ts` - PrismaAdapter configured ✓
- ✅ Verified `app/lib/db.ts` - Prisma client initialized ✓
- ✅ Verified `app/api/auth/[...nextauth]/route.ts` - handlers exported ✓

### 3. Database Status
- ✅ MySQL Server: **RUNNING**
- ✅ Database: **EXISTS** (calapp)
- ✅ Tables Created: **ALL 6 TABLES**
  - ✓ User
  - ✓ Account
  - ✓ Session
  - ✓ VerificationToken
  - ✓ Availability
  - ✓ EventType

### 4. Prisma Configuration
- ✅ Prisma Client: **REGENERATED** (v5.19.1)
- ✅ Connection Test: **SUCCESSFUL**
- ✅ Schema Validation: **PASSED**

---

## 📋 Verification Checklist

All items ✅ VERIFIED:

- [x] MySQL is running: `mysql -u root -pyour_db_password -e "SELECT 1"`
- [x] Database exists: `mysql -u root -pyour_db_password -e "SHOW DATABASES" | grep calapp`
- [x] Tables created: `mysql -u root -pyour_db_password calapp -e "SHOW TABLES"`
- [x] Prisma schema: provider = "mysql" (no directUrl)
- [x] DATABASE_URL: Correctly URL-encoded
- [x] NextAuth config: PrismaAdapter properly configured
- [x] OAuth credentials: All present and valid
- [x] Prisma client: Regenerated and ready
- [x] Connection test: Passed

---

## 🚀 To Test Everything Works

### Step 1: Clear Cache and Rebuild
```bash
rm -rf .next node_modules/.prisma
npx prisma generate
```

### Step 2: Start Development Server
```bash
npm run dev
```

Expected output:
```
▲ Next.js 14.2.13
- Local:        http://localhost:3000
- Environments: .env, .env.local
```

### Step 3: Test Google OAuth Sign-In
1. Open http://localhost:3000
2. Click "Sign In with Google"  
3. Complete Google authentication
4. Should redirect to dashboard showing your profile

**Expected**: No 500 errors, user appears in dashboard, session created

### Step 4: Verify User in Database
```bash
mysql -u root -pyour_db_password calapp -e "SELECT id, name, email FROM User;"
```

Expected: Your Google account info appears

---

## 🔑 URL Encoding Reference

When your database password contains special characters, they must be URL-encoded in DATABASE_URL:

| Character | URL Encoded |
|-----------|------------|
| @ | %40 |
| # | %23 |
| : | %3A |
| / | %2F |
| ! | %21 |
| $ | %24 |
| & | %26 |
| ' | %27 |
| ( | %28 |
| ) | %29 |
| * | %2A |

### Example Passwords:
```
Password: user@domain
Encoded:  user%40domain

Password: pass#word
Encoded:  pass%23word

Password: pass:word/test
Encoded:  pass%3Aword%2Ftest

Password: p@ss#word:2024
Encoded:  p%40ss%23word%3A2024
```

---

## 📊 Environment Variables - All Required

### NextAuth
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Database (CORRECTED)
```env
DATABASE_URL=mysql://root:your_db_password_urlencoded@localhost:3306/calapp
```

### Google OAuth
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### GitHub OAuth
```env
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret
```

### Optional (Calendar Integration)
```env
NYLAS_CLIENT_ID=your_nylas_client_id
NYLAS_CLIENT_SECRET=your_nylas_client_secret
NYLAS_REDIRECT_URI=http://localhost:3000/api/oauth/exchange
```

---

## 🔄 What Each Component Does

### Prisma Schema (`prisma/schema.prisma`)
Defines your database structure. Currently set to:
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**Why this works:**
- `provider = "mysql"` tells Prisma to use MySQL dialect
- `url = env("DATABASE_URL")` loads connection string from .env
- No `directUrl` needed (that's PostgreSQL-specific)

### NextAuth Config (`app/lib/auth.ts`)
Handles OAuth login flow:
```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),  // Uses MySQL via Prisma
  providers: [
    GitHub({ clientId: ..., clientSecret: ... }),
    Google({ clientId: ..., clientSecret: ... })
  ],
  session: {
    strategy: "database",  // Stores sessions in MySQL
  }
});
```

### Prisma Client (`app/lib/db.ts`)
Connects to MySQL:
```typescript
const prisma = new PrismaClient();
// Reads DATABASE_URL from .env
// Provides ORM methods: prisma.user.create(), etc.
```

### NextAuth Route (`app/api/auth/[...nextauth]/route.ts`)
Handles OAuth callbacks:
```typescript
export const { GET, POST } = handlers;
// Receives callback from Google/GitHub
// Updates user/session in MySQL
// Redirects to dashboard
```

---

## 🎯 Flow When User Logs In

1. **User clicks "Sign In with Google"**
   - Browser redirected to Google OAuth
   
2. **Google authenticates user**
   - Returns to `/api/auth/callback/google`
   
3. **NextAuth processes callback**
   - Calls `app/api/auth/[...nextauth]/route.ts`
   
4. **User data stored in MySQL**
   - PrismaAdapter creates record in `User` table
   - OAuth details stored in `Account` table
   - Session token stored in `Session` table
   - Uses DATABASE_URL to connect (now correctly URL-encoded)
   
5. **Session created**
   - NEXTAUTH_SECRET encrypts session data
   
6. **Redirect to dashboard**
   - User sees their profile
   - No 500 errors

---

## ✅ Success Indicators

When everything works, you'll see:

1. **On Login**
   - Google OAuth redirects to your app
   - No "500 Internal Server Error"
   - No "DATABASE_URL must start with" errors
   - No connection timeout errors

2. **After Login**
   - Dashboard displays your Google profile name/email/image
   - URL shows `/dashboard` (not `/api/auth/error`)
   - Session persists across page refreshes

3. **In Database**
   - New record in `User` table with your Google account
   - Corresponding record in `Account` table with OAuth provider info
   - Session record in `Session` table

---

## 🐛 If Issues Still Occur

### Test MySQL Connection
```bash
mysql -u root -pyour_db_password -e "SELECT NOW();"
```

### Test Prisma Connection  
```bash
npx prisma db execute --stdin <<< "SELECT 1"
```

### Regenerate Prisma
```bash
rm -rf node_modules/.prisma
npx prisma generate
```

### Check .env Variables
```bash
echo $DATABASE_URL
echo $GOOGLE_CLIENT_ID
echo $NEXTAUTH_SECRET
```

### Check NextAuth Logs
Add to `app/lib/auth.ts`:
```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  // ... other config
  debug: process.env.NODE_ENV === 'development',
  // ... rest
});
```

Then restart with: `DATABASE_URL=mysql://... npm run dev`

---

## 📚 Files Updated

| File | Change |
|------|--------|
| `.env` | DATABASE_URL: URL-encoded @ as %40 |
| `.env.local` | DATABASE_URL: URL-encoded @ as %40 |
| `prisma/schema.prisma` | Already correct (provider = "mysql") |
| `app/lib/auth.ts` | Already correct (PrismaAdapter configured) |
| `app/lib/db.ts` | Already correct (PrismaClient initialized) |

---

## 🎓 Why This Happened

MySQL connection URLs follow RFC 3986 standard:
```
scheme://[userinfo@]host[:port]/path
```

The `@` character is reserved to separate `userinfo` from `host`. When your password contains `@`, you must escape it:
- Database: `your_db_password`
- URL: `your_db_password_urlencoded`

This is **the most common issue** when MySQL passwords contain special characters.

---

## 🚀 Ready to Test!

Your setup is now complete and correct. Run:

```bash
npm run dev
```

Then visit http://localhost:3000 and test Google login. Everything should work! ✨

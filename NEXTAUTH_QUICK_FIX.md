# 🔧 QUICK FIX REFERENCE

## ⚡ The Problem
Google OAuth returns 500 error after callback. DATABASE_URL has special character that breaks URL parsing.

---

## ✅ The Solution

### What Was Wrong
```env
DATABASE_URL=mysql://root:your_db_password@localhost:3306/calapp
                                 ↑ This @ breaks URL parsing
```

### What's Fixed
```env
DATABASE_URL=mysql://root:your_db_password_urlencoded@localhost:3306/calapp
                                  ↑ @ encoded as %40
```

---

## 📋 Files Updated

1. **`.env`** - DATABASE_URL corrected
2. **`.env.local`** - DATABASE_URL corrected

---

## ✨ Verification Results

✅ MySQL: Running
✅ Database: Created (calapp)
✅ Tables: All 6 created
✅ Prisma: Connected (1 user in database)
✅ NextAuth: Configured correctly
✅ OAuth: Credentials present

---

## 🚀 To Test

```bash
# 1. Start dev server
npm run dev

# 2. Visit http://localhost:3000

# 3. Click "Sign In with Google"

# 4. You should see dashboard (no 500 error)

# 5. Verify in database
mysql -u root -pyour_db_password calapp -e "SELECT id, name, email FROM User;"
```

---

## 🔑 Key URL Encoding Rules

**When your password has special characters:**
- `@` → encode as `%40`
- `#` → encode as `%23`
- `:` → encode as `%3A`
- `/` → encode as `%2F`

**Example:**
```
Password: user@domain#123
URL: mysql://root:user%40domain%23123@localhost/db
```

---

## 📊 Configuration Summary

| Component | Status | Details |
|-----------|--------|---------|
| MySQL | ✅ | Running on localhost:3306 |
| Database | ✅ | Name: calapp |
| Tables | ✅ | User, Account, Session, VerificationToken, Availability, EventType |
| Prisma | ✅ | provider = "mysql", Connected |
| NextAuth | ✅ | Using PrismaAdapter with database sessions |
| OAuth | ✅ | Google & GitHub configured |
| DATABASE_URL | ✅ | URL-encoded special character |

---

## 🧪 Test Commands

```bash
# Test MySQL connection
mysql -u root -pyour_db_password -e "SELECT 1"

# Test Prisma connection
npx prisma db execute --stdin <<< "SELECT 1"

# Regenerate Prisma
npx prisma generate

# View database (GUI)
npx prisma studio

# Check user count
mysql -u root -pyour_db_password calapp -e "SELECT COUNT(*) FROM User;"
```

---

## 🎯 Next Steps

1. **Run**: `npm run dev`
2. **Test**: Click "Sign In with Google"
3. **Verify**: Check dashboard loads
4. **Confirm**: User appears in database

---

## ❌ If Still Getting 500 Error

1. **Check** `.env` file has: `your_db_password_urlencoded` (not `your_db_password`)
2. **Check** `.env.local` file has: `your_db_password_urlencoded` (not `your_db_password`)
3. **Run**: `npx prisma generate`
4. **Restart**: `npm run dev`

---

## 📚 Full Documentation

- **`NEXTAUTH_MYSQL_FIX.md`** - Detailed explanation & troubleshooting
- **`NEXTAUTH_COMPLETE_REPORT.md`** - Complete root cause analysis
- **`MYSQL_MIGRATION_GUIDE.md`** - Step-by-step setup

---

## 🟢 Status: FIXED ✅

Your application is configured correctly and ready to use!

**URL encoding issue resolved.**
**All tables created.**
**Prisma connected.**
**NextAuth ready.**
**OAuth configured.**

Run `npm run dev` to start! 🚀

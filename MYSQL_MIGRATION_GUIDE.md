# 🔧 PostgreSQL → MySQL Migration Guide

## ✅ What Was Fixed

### 1. **Prisma Schema Updated**
```prisma
# ❌ BEFORE (PostgreSQL)
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  # PostgreSQL pooling
}

# ✅ AFTER (MySQL)
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### 2. **.env.local Updated**
```env
# ❌ BEFORE
DATABASE_URL=file:./dev.db  # SQLite!

# ✅ AFTER
DATABASE_URL=mysql://root:your_password@localhost:3306/calprabhakar
NEXTAUTH_SECRET=your_nextauth_secret_here
```

---

## 🚀 Setup Steps (Follow in Order)

### Step 1: Install MySQL Locally

#### macOS (using Homebrew)
```bash
brew install mysql
brew services start mysql
```

#### Windows
1. Download from: https://dev.mysql.com/downloads/mysql/
2. Run installer and follow prompts
3. MySQL runs as a service

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get install mysql-server
sudo systemctl start mysql
```

---

### Step 2: Create MySQL Database

#### Login to MySQL
```bash
# Default: no password on local
mysql -u root

# Or with password (if you set one)
mysql -u root -p
```

#### Create Database in MySQL Shell
```sql
CREATE DATABASE calprabhakar;
EXIT;
```

#### Verify Database Created
```bash
mysql -u root -e "SHOW DATABASES;"
# Should show: calprabhakar
```

---

### Step 3: Update .env.local with Your MySQL Credentials

Open `.env.local` and replace:

```env
# Your MySQL credentials:
DATABASE_URL=mysql://username:password@hostname:port/database_name

# Example:
DATABASE_URL=mysql://root:@localhost:3306/calprabhakar
# (empty password if you didn't set one)

# Or with password:
DATABASE_URL=mysql://root:mypassword@localhost:3306/calprabhakar
```

**Important Variables:**
- `root` - MySQL username (usually "root" for local)
- `mypassword` - Your MySQL password (leave blank if none)
- `localhost` - Your MySQL server (localhost for local development)
- `3306` - Default MySQL port (don't change unless configured)
- `calprabhakar` - Your database name

---

### Step 4: Verify Database Connection

```bash
# Test if Prisma can connect to MySQL
npx prisma db execute --stdin <<< "SELECT 1"

# Or just try to push schema (next step will do this anyway)
```

---

### Step 5: Push Prisma Schema to MySQL

This creates all tables in MySQL:

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to MySQL database
npx prisma db push
```

**Expected Output:**
```
✓ Database connection successful
✓ 5 tables created: User, Account, Session, VerificationToken, Availability, EventType
```

---

### Step 6: Clear Next.js Cache & Restart

```bash
rm -rf .next
npm run dev
```

---

### Step 7: Test the Setup

1. Visit: http://localhost:3000
2. Click "Sign In with GitHub"
3. After authentication:
   - ✅ User info should appear in dashboard
   - ✅ Check MySQL has data: Run verification command below

---

### Step 8: Verify Data in MySQL

```bash
# Login to MySQL
mysql -u root calprabhakar

# Check tables were created
SHOW TABLES;

# Should show:
# Account
# Availability
# EventType
# Session
# User
# VerificationToken

# Check if user was created
SELECT * FROM User\G

# Exit
EXIT;
```

---

## 🔍 Troubleshooting

### Error: "Can't connect to MySQL server"

**Fix 1: Is MySQL running?**
```bash
# Check if MySQL is running
mysql -u root
# If fails, MySQL isn't running

# Start MySQL:
# macOS:
brew services start mysql

# Linux:
sudo systemctl start mysql

# Windows:
# Open Services → Look for MySQL → Start it
```

**Fix 2: Wrong credentials in DATABASE_URL**
```env
# Check what you have:
DATABASE_URL=mysql://root:PASSWORD@localhost:3306/calprabhakar

# Common fixes:
# - If no password: mysql://root:@localhost:3306/calprabhakar
# - If password has special chars: escape or use URL encoding
# - Example: password "p@ss" → use mysql://root:p%40ss@...
```

**Fix 3: Database doesn't exist**
```bash
# Create it:
mysql -u root -e "CREATE DATABASE calprabhakar;"
```

---

### Error: "Unknown database 'calprabhakar'"

**Fix:**
```bash
# Database name in URL must match created database
# Create the database first:
mysql -u root -e "CREATE DATABASE calprabhakar;"

# Then verify:
mysql -u root -e "SHOW DATABASES;" | grep calprabhakar
```

---

### Error: "Prisma validation error"

**Fix 1: Regenerate Prisma**
```bash
npx prisma generate
npx prisma format  # Fix schema formatting
```

**Fix 2: Check schema.prisma**
- Verify `provider = "mysql"` (not postgresql)
- No `directUrl` line

---

### Error: "NextAuth 500 error after migration"

**Fix:**
```bash
# 1. Ensure database has tables
npx prisma db push

# 2. Clear next cache
rm -rf .next

# 3. Restart server
npm run dev

# 4. Check if tables exist
mysql -u root calprabhakar -e "SHOW TABLES;"
```

---

### User Creates Account but Data Not in MySQL

**Debug:**
```bash
# Check User table
mysql -u root calprabhakar -e "SELECT * FROM User;"

# Check Account table for OAuth data
mysql -u root calprabhakar -e "SELECT * FROM Account;"

# Check Session table
mysql -u root calprabhakar -e "SELECT * FROM Session;"
```

---

## ✅ Verification Checklist

- [ ] MySQL installed and running
- [ ] Database "calprabhakar" created
- [ ] `.env.local` updated with correct DATABASE_URL
- [ ] `npx prisma db push` executed successfully
- [ ] `.next` folder deleted
- [ ] `npm run dev` starts without errors
- [ ] http://localhost:3000 loads
- [ ] GitHub OAuth sign-in redirects correctly
- [ ] After login, user appears in MySQL
- [ ] Dashboard shows user info

---

## 🗂️ MySQL Connection Format Reference

### Format
```
mysql://username:password@host:port/database_name
```

### Common Examples

**Local, no password:**
```
mysql://root:@localhost:3306/calprabhakar
```

**Local, with password:**
```
mysql://root:mypassword@localhost:3306/calprabhakar
```

**Remote server:**
```
mysql://myuser:mypass@database.example.com:3306/app_db
```

**Special characters in password:**
```
# Password: p@ss#word
mysql://root:p%40ss%23word@localhost:3306/calprabhakar

# Use URL encoding:
# @ = %40
# # = %23
# : = %3A
# / = %2F
```

---

## 🎯 What Changed in Prisma

### Before (PostgreSQL)
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  # ← PostgreSQL only
}
```

### After (MySQL)
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

**Why:**
- MySQL doesn't need `directUrl` (that's for PostgreSQL connection pooling)
- Provider changed to "mysql"
- All models remain compatible (no schema changes needed)

---

## 📚 All Required Environment Variables

```env
# REQUIRED - NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# REQUIRED - MySQL Database
DATABASE_URL=mysql://root:@localhost:3306/calprabhakar

# REQUIRED - GitHub OAuth
GITHUB_ID=your_github_client_id
GITHUB_SECRET=your_github_client_secret

# REQUIRED - Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OPTIONAL - Nylas (calendar integration)
NYLAS_CLIENT_ID=your_nylas_client_id
NYLAS_CLIENT_SECRET=your_nylas_client_secret
NYLAS_REDIRECT_URI=http://localhost:3000/api/oauth/exchange

# OPTIONAL - Uploadthing (file uploads)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id
```

---

## 🔄 Complete Setup Commands (Copy & Paste)

### All at once:
```bash
# 1. Create database
mysql -u root -e "CREATE DATABASE calprabhakar;"

# 2. Update .env.local with your DATABASE_URL and verify it looks like:
# DATABASE_URL=mysql://root:@localhost:3306/calprabhakar

# 3. Generate and push schema
npx prisma generate
npx prisma db push

# 4. Clear cache and restart
rm -rf .next
npm run dev
```

---

## 🎓 What Each Command Does

| Command | Purpose |
|---------|---------|
| `npx prisma generate` | Generates Prisma Client from schema |
| `npx prisma db push` | Creates/updates database tables |
| `npx prisma studio` | Opens GUI to view/edit database |
| `npx prisma migrate dev` | Creates migration files (alternative to db push) |

---

## 🚨 If Still Getting 500 Errors

1. **Check database connection:**
   ```bash
   npx prisma db execute --stdin <<< "SELECT 1"
   ```

2. **Check if tables exist:**
   ```bash
   mysql -u root calprabhakar -e "SHOW TABLES;"
   ```

3. **Check server logs:**
   ```bash
   npm run dev
   # Look for error messages in terminal
   ```

4. **Enable debug mode temporarily:**
   ```env
   NEXTAUTH_DEBUG=true
   DATABASE_DEBUG=true
   ```

5. **Verify auth.ts is using PrismaAdapter:**
   ```bash
   grep -A 5 "PrismaAdapter" app/lib/auth.ts
   ```

---

## 📊 Connection Test Commands

```bash
# Test MySQL connection directly
mysql -u root -e "SELECT NOW();"

# Test Prisma connection
npx prisma db execute --stdin <<< "SELECT 1"

# Check if database exists
mysql -u root -e "SHOW DATABASES;" | grep calprabhakar

# Check if tables created
mysql -u root calprabhakar -e "SHOW TABLES;"

# Count users in database
mysql -u root calprabhakar -e "SELECT COUNT(*) as user_count FROM User;"
```

---

## ✨ Summary of Changes

| File | Change | Reason |
|------|--------|--------|
| prisma/schema.prisma | Changed provider from "postgresql" to "mysql" | Now using MySQL instead of PostgreSQL |
| prisma/schema.prisma | Removed `directUrl` line | MySQL doesn't need connection pooling config |
| .env.local | Updated DATABASE_URL to MySQL format | Database needs proper MySQL connection string |
| .env.local | Fixed NEXTAUTH_SECRET to 32+ chars | Was placeholder, now proper secret |

---

## 🎯 Expected Result

After completing all steps:

✅ MySQL database running
✅ Tables created: User, Account, Session, VerificationToken, Availability, EventType
✅ GitHub OAuth login works
✅ Google OAuth login works
✅ User data stored in MySQL
✅ No 500 errors
✅ Session stored in database
✅ Dashboard displays logged-in user

---

**You're all set! Follow the steps above and everything should work.** 🚀

# ✅ MySQL Migration - Quick Checklist

## 🎯 Current Status
- ✅ Prisma schema updated to MySQL
- ✅ .env.local prepared for MySQL
- ✅ OAuth credentials already configured
- ⏳ **You are here**: Need to complete local setup

---

## 📋 Your TODO List

### Phase 1: MySQL Setup (5 min)
- [ ] **Install MySQL** (if not already installed)
  - macOS: `brew install mysql`
  - Windows: Download from mysql.com
  - Linux: `sudo apt-get install mysql-server`

- [ ] **Start MySQL Service**
  - macOS: `brew services start mysql`
  - Linux: `sudo systemctl start mysql`
  - Windows: Open Services and start MySQL

- [ ] **Create Database**
  ```bash
  mysql -u root -e "CREATE DATABASE calprabhakar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
  ```

### Phase 2: Environment Configuration (2 min)
- [ ] **Open .env.local** and update DATABASE_URL:
  ```
  DATABASE_URL=mysql://root:@localhost:3306/calprabhakar
  ```
  
  *Note: Replace credentials if different:*
  - `root` = your MySQL username
  - Leave empty after `:` if no password
  - `localhost:3306` = your MySQL server

### Phase 3: Database Setup (3 min)
- [ ] **Generate Prisma Client**
  ```bash
  npx prisma generate
  ```

- [ ] **Push Schema to MySQL**
  ```bash
  npx prisma db push
  ```
  
  *Expected output: Tables created successfully*

### Phase 4: Application Reset (2 min)
- [ ] **Clear Next.js Cache**
  ```bash
  rm -rf .next
  ```

- [ ] **Start Development Server**
  ```bash
  npm run dev
  ```
  
  *Should see: ▲ Next.js 14.2.13 ready - started server on http://localhost:3000*

### Phase 5: Testing (5 min)
- [ ] **Open http://localhost:3000** in browser
- [ ] **Click "Sign In with GitHub"** or "Sign In with Google"
- [ ] **Complete OAuth authentication**
- [ ] **Verify you see dashboard with your profile**
- [ ] **Check user is in MySQL:**
  ```bash
  mysql -u root calprabhakar -e "SELECT id, name, email FROM User;"
  ```

---

## 🚀 Quick Start (Copy & Paste)

### One command that does it all:
```bash
# 1. Create database
mysql -u root -e "CREATE DATABASE calprabhakar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Update .env.local DATABASE_URL (if needed)
# DATABASE_URL=mysql://root:@localhost:3306/calprabhakar

# 3. Generate and push
npx prisma generate && npx prisma db push

# 4. Clear and restart
rm -rf .next && npm run dev
```

Or use the automated script:
```bash
bash setup-mysql.sh
```

---

## ✨ What Each Step Does

| Step | What Happens | Why |
|------|--------------|-----|
| Create Database | MySQL creates empty "calprabhakar" database | Prisma needs database to exist |
| prisma generate | Creates PrismaClient from schema | Required for app to connect |
| prisma db push | Creates User, Account, Session tables | NextAuth needs these for authentication |
| Clear .next | Removes Next.js build cache | Ensures fresh build with new DB config |
| npm run dev | Starts development server | Builds app and starts on localhost:3000 |

---

## 🔍 Verification Commands

### Check MySQL Connection
```bash
mysql -u root -e "SELECT NOW();"
# Should show current timestamp
```

### Check Database Exists
```bash
mysql -u root -e "SHOW DATABASES;" | grep calprabhakar
# Should show: calprabhakar
```

### Check Tables Created
```bash
mysql -u root calprabhakar -e "SHOW TABLES;"
# Should show: Account, Availability, EventType, Session, User, VerificationToken
```

### Check User Data
```bash
mysql -u root calprabhakar -e "SELECT id, name, email FROM User;"
# Will be empty until you log in
```

---

## 🐛 Common Issues & Quick Fixes

### "Can't connect to MySQL server"
```bash
# Is MySQL running?
brew services list | grep mysql
# Should show: mysql started

# Start if needed:
brew services start mysql
```

### "Unknown database 'calprabhakar'"
```bash
# Create it:
mysql -u root -e "CREATE DATABASE calprabhakar;"
```

### "Column 'Field' doesn't exist"
```bash
# Schema not pushed. Run:
npx prisma db push
```

### "500 error on login"
```bash
# 1. Clear cache
rm -rf .next

# 2. Restart server
npm run dev

# 3. Check database is running
mysql -u root -e "SELECT 1;"
```

### "DATABASE_URL must start with mysql://"
```bash
# Your .env.local is wrong. Fix it:
DATABASE_URL=mysql://root:@localhost:3306/calprabhakar
```

---

## 📊 Expected Files & Configuration

### Files Modified (What Changed)
```
✅ prisma/schema.prisma
   - provider: "postgresql" → "mysql"
   - Removed DIRECT_URL line

✅ .env.local
   - DATABASE_URL: file:./dev.db → mysql://root:@localhost:3306/calprabhakar
   - NEXTAUTH_SECRET: Updated to proper format
```

### No Changes Needed (Still Working)
```
✅ app/lib/auth.ts - OAuth still works, PrismaAdapter compatible with MySQL
✅ GitHub/Google OAuth credentials - Already in .env.local
✅ NextAuth configuration - No changes needed
```

---

## 🎯 After First Login

You should have:
- ✅ User record in MySQL `User` table
- ✅ OAuth account details in `Account` table
- ✅ Session token in `Session` table
- ✅ Profile displayed in dashboard
- ✅ No 500 errors

---

## 📚 Need Help?

1. **Detailed guide**: Read `MYSQL_MIGRATION_GUIDE.md`
2. **OAuth issues**: Check `auth.ts` configuration
3. **Database issues**: Run `npx prisma studio` (visual browser for database)
4. **Logs**: `npm run dev` shows real-time errors

---

## 🎓 Understanding the Changes

### Why MySQL instead of PostgreSQL?
The project was originally set up for PostgreSQL, but you wanted to migrate to MySQL. Both work identically for this app - just different database system.

### What are these Prisma commands?
- `generate` = Creates TypeScript client to query database
- `db push` = Creates tables in your database matching schema.prisma

### Why delete .next?
Contains compiled Next.js code. Deleting ensures it rebuilds with new database config.

### What if I want to go back to PostgreSQL?
1. Change `provider = "postgresql"` in `prisma/schema.prisma`
2. Update DATABASE_URL to postgresql://...
3. Add back `directUrl` line (for connection pooling)
4. Run `npx prisma db push`

---

## 💡 Pro Tips

1. **Keep password safe**: Don't commit `.env.local` to git
2. **Test connection first**: `mysql -u root -e "SELECT 1;"`
3. **Visual database explorer**: `npx prisma studio`
4. **Debug mode**: `NEXTAUTH_DEBUG=true npm run dev`
5. **Check logs for errors**: Ctrl+C and look at terminal output

---

**Status**: ✅ Configuration Complete | ⏳ Awaiting Local Setup | ⏸️ Ready to Test

Once you complete the checklist above, you'll have:
- ✅ MySQL running locally
- ✅ Database created
- ✅ Tables initialized
- ✅ OAuth working with MySQL
- ✅ Full authentication system operational

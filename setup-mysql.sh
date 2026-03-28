#!/bin/bash

# MySQL Migration Helper Script
# Run: bash setup-mysql.sh

echo "🔧 Cal Prabhakar - MySQL Setup Helper"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if MySQL is installed and running
check_mysql() {
    echo -e "${BLUE}1️⃣  Checking MySQL Installation...${NC}"
    
    if command -v mysql &> /dev/null; then
        echo -e "${GREEN}✓ MySQL is installed${NC}"
        
        # Try to connect
        if mysql -u root -e "SELECT 1" &> /dev/null; then
            echo -e "${GREEN}✓ MySQL is running and accessible${NC}"
            return 0
        else
            echo -e "${YELLOW}⚠ MySQL is installed but not accessible${NC}"
            echo "Fix: brew services start mysql (macOS)"
            return 1
        fi
    else
        echo -e "${RED}✗ MySQL is not installed${NC}"
        echo "Install: brew install mysql (macOS) or download from mysql.com"
        return 1
    fi
}

# Create database
create_database() {
    echo ""
    echo -e "${BLUE}2️⃣  Creating MySQL Database...${NC}"
    
    if mysql -u root -e "CREATE DATABASE IF NOT EXISTS calprabhakar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
        echo -e "${GREEN}✓ Database 'calprabhakar' created/verified${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to create database${NC}"
        echo "Try: mysql -u root -e \"CREATE DATABASE calprabhakar;\""
        return 1
    fi
}

# Check .env.local
check_env() {
    echo ""
    echo -e "${BLUE}3️⃣  Checking .env.local...${NC}"
    
    if [ ! -f ".env.local" ]; then
        echo -e "${RED}✗ .env.local not found${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✓ .env.local exists${NC}"
    
    # Check if DATABASE_URL is MySQL format
    if grep -q "^DATABASE_URL=mysql://" .env.local; then
        echo -e "${GREEN}✓ DATABASE_URL is MySQL format${NC}"
        
        # Extract DATABASE_URL for display
        DB_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'=' -f2-)
        echo "  URL: $DB_URL"
        return 0
    else
        echo -e "${YELLOW}⚠ DATABASE_URL not in MySQL format${NC}"
        echo "  Update .env.local:"
        echo "  DATABASE_URL=mysql://root:@localhost:3306/calprabhakar"
        return 1
    fi
}

# Check Prisma schema
check_prisma() {
    echo ""
    echo -e "${BLUE}4️⃣  Checking Prisma Schema...${NC}"
    
    if [ ! -f "prisma/schema.prisma" ]; then
        echo -e "${RED}✗ prisma/schema.prisma not found${NC}"
        return 1
    fi
    
    if grep -q "provider = \"mysql\"" prisma/schema.prisma; then
        echo -e "${GREEN}✓ Prisma provider is MySQL${NC}"
        
        # Check if no directUrl
        if grep -q "directUrl" prisma/schema.prisma; then
            echo -e "${YELLOW}⚠ Found 'directUrl' in schema (MySQL doesn't need it)${NC}"
            return 1
        else
            echo -e "${GREEN}✓ No directUrl found (correct for MySQL)${NC}"
            return 0
        fi
    else
        echo -e "${RED}✗ Prisma provider is not MySQL${NC}"
        echo "  Update prisma/schema.prisma: provider = \"mysql\""
        return 1
    fi
}

# Push schema to database
push_schema() {
    echo ""
    echo -e "${BLUE}5️⃣  Pushing Prisma Schema to Database...${NC}"
    
    echo "Running: npx prisma generate"
    if npx prisma generate &> /dev/null; then
        echo -e "${GREEN}✓ Prisma Client generated${NC}"
    else
        echo -e "${YELLOW}⚠ Prisma generate had issues (non-blocking)${NC}"
    fi
    
    echo ""
    echo "Running: npx prisma db push"
    if npx prisma db push --skip-generate; then
        echo -e "${GREEN}✓ Schema pushed to MySQL database${NC}"
        return 0
    else
        echo -e "${RED}✗ Failed to push schema${NC}"
        echo "Check:"
        echo "  1. MySQL is running: mysql -u root -e 'SELECT 1'"
        echo "  2. Database exists: mysql -u root -e 'SHOW DATABASES' | grep calprabhakar"
        echo "  3. DATABASE_URL is correct in .env.local"
        return 1
    fi
}

# Clear Next.js cache
clear_cache() {
    echo ""
    echo -e "${BLUE}6️⃣  Clearing Next.js Cache...${NC}"
    
    if rm -rf .next; then
        echo -e "${GREEN}✓ .next folder removed${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ Could not remove .next folder${NC}"
        return 1
    fi
}

# Verify tables
verify_tables() {
    echo ""
    echo -e "${BLUE}7️⃣  Verifying Database Tables...${NC}"
    
    TABLES=$(mysql -u root -D calprabhakar -e "SHOW TABLES;" 2>/dev/null | wc -l)
    
    if [ "$TABLES" -gt 1 ]; then
        echo -e "${GREEN}✓ Database tables created ($((TABLES-1)) tables found)${NC}"
        
        # List tables
        echo ""
        echo "Tables in calprabhakar:"
        mysql -u root -D calprabhakar -e "SHOW TABLES;" 2>/dev/null
        return 0
    else
        echo -e "${RED}✗ No tables found in database${NC}"
        return 1
    fi
}

# Final instructions
final_steps() {
    echo ""
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅ Setup Complete!${NC}"
    echo -e "${YELLOW}════════════════════════════════════════${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Start the development server:"
    echo "   ${BLUE}npm run dev${NC}"
    echo ""
    echo "2. Open browser: http://localhost:3000"
    echo ""
    echo "3. Test OAuth:"
    echo "   - Click 'Sign In with GitHub' or 'Sign In with Google'"
    echo "   - Complete authentication"
    echo "   - You should see your profile in the dashboard"
    echo ""
    echo "4. Verify user in database:"
    echo "   ${BLUE}mysql -u root calprabhakar -e 'SELECT * FROM User\\\\G'${NC}"
    echo ""
    echo "Troubleshoot: Read MYSQL_MIGRATION_GUIDE.md"
    echo ""
}

# Main execution
main() {
    echo ""
    
    # Check MySQL
    if ! check_mysql; then
        echo ""
        echo -e "${RED}Cannot proceed without MySQL. Please install and start MySQL first.${NC}"
        exit 1
    fi
    
    # Create database
    if ! create_database; then
        echo -e "${RED}Failed to create database${NC}"
        exit 1
    fi
    
    # Check environment
    check_env
    HAS_ENV=$?
    
    # Check Prisma
    if ! check_prisma; then
        echo -e "${RED}Prisma schema not configured for MySQL${NC}"
        exit 1
    fi
    
    # Push schema
    if ! push_schema; then
        echo -e "${RED}Failed to push schema${NC}"
        exit 1
    fi
    
    # Clear cache
    clear_cache
    
    # Verify tables
    if ! verify_tables; then
        echo -e "${YELLOW}⚠ No tables found. Try running: npx prisma db push${NC}"
    fi
    
    # Final instructions
    final_steps
}

# Run main
main

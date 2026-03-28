#!/bin/bash

# CalPrabhakar OAuth Setup Helper
# This script helps you generate NEXTAUTH_SECRET and validate configuration

echo "================================"
echo "CalPrabhakar OAuth Setup Helper"
echo "================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found!"
    echo "Creating .env.local from template..."
    # User should manually create this - can't auto-create without values
else
    echo "✅ .env.local found"
fi

# Generate NEXTAUTH_SECRET
echo ""
echo "Generating NEXTAUTH_SECRET..."
SECRET=$(openssl rand -base64 32)
echo "Generated secret: $SECRET"
echo ""
echo "To use this secret, update .env.local:"
echo "NEXTAUTH_SECRET=$SECRET"
echo ""

# Check for required env variables
echo "================================"
echo "Checking Environment Variables"
echo "================================"
echo ""

check_env() {
    if grep -q "^$1=" .env.local 2>/dev/null; then
        VALUE=$(grep "^$1=" .env.local | cut -d'=' -f2)
        if [ -z "$VALUE" ] || [[ "$VALUE" == "your_"* ]]; then
            echo "❌ $1: NOT SET (placeholder value found)"
            return 1
        else
            echo "✅ $1: SET"
            return 0
        fi
    else
        echo "❌ $1: MISSING from .env.local"
        return 1
    fi
}

check_env "NEXTAUTH_URL"
check_env "NEXTAUTH_SECRET"
check_env "GITHUB_ID"
check_env "GITHUB_SECRET"
check_env "GOOGLE_CLIENT_ID"
check_env "GOOGLE_CLIENT_SECRET"
check_env "DATABASE_URL"

echo ""
echo "================================"
echo "Setup Links"
echo "================================"
echo ""
echo "GitHub OAuth Setup:"
echo "  👉 https://github.com/settings/developers"
echo "  Callback URL: http://localhost:3000/api/auth/callback/github"
echo ""
echo "Google OAuth Setup:"
echo "  👉 https://console.cloud.google.com/"
echo "  Redirect URI: http://localhost:3000/api/auth/callback/google"
echo ""

# Check if .next needs to be cleared
if [ -d .next ]; then
    echo "================================"
    echo "Clearing .next Build Cache"
    echo "================================"
    read -p "Clear .next folder? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf .next
        echo "✅ .next cleared"
    fi
fi

echo ""
echo "================================"
echo "Next Steps"
echo "================================"
echo ""
echo "1. Update .env.local with your credentials:"
echo "   - Generated NEXTAUTH_SECRET (copy from above)"
echo "   - GitHub ID and Secret"
echo "   - Google Client ID and Secret"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Test login at:"
echo "   http://localhost:3000"
echo ""
echo "For detailed setup guide, see: OAUTH_SETUP_GUIDE.md"

#!/bin/bash

# GLOVIA NEPAL - FINAL PRODUCTION DEPLOYMENT SCRIPT
# This script will guide you through the final steps to make the system production-ready

echo "🚀 GLOVIA NEPAL - FINAL PRODUCTION DEPLOYMENT"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}📦 Step 1: Checking Vercel Deployment Status${NC}"
echo "----------------------------------------------"
echo "Checking if backend deployment is complete..."

attempts=0
max_attempts=20

while [ $attempts -lt $max_attempts ]; do
  # Test if new DTO is deployed
  response=$(curl -s -X PUT 'https://backend-glovia.vercel.app/api/v1/admin/products/698faa3c7ef2a4e5f87ad0c6' \
    -H 'Authorization: Bearer '$(curl -s -X POST 'https://backend-glovia.vercel.app/api/v1/auth/login' \
    -H 'Content-Type: application/json' \
    -d '{"email":"superadmin@glovia.com.np","password":"SuperAdmin123!"}' | python3 -c "import sys, json; print(json.load(sys.stdin)['accessToken'])" 2>/dev/null) \
    -H 'Content-Type: application/json' \
    -d '{"isNewProduct":true}' 2>/dev/null)
  
  if echo "$response" | grep -q "property isNewProduct should not exist"; then
    attempts=$((attempts + 1))
    echo -n "."
    sleep 10
  else
    echo ""
    echo -e "${GREEN}✓ Backend deployment complete!${NC}"
    break
  fi
done

if [ $attempts -eq $max_attempts ]; then
  echo ""
  echo -e "${YELLOW}⚠️  Deployment is taking longer than expected.${NC}"
  echo "You can:"
  echo "1. Check Vercel dashboard: https://vercel.com/dashboard"
  echo "2. Run this script again in a few minutes"
  echo "3. Or continue manually with the steps below"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo ""
echo -e "${BLUE}📝 Step 2: Updating Product Data${NC}"
echo "----------------------------------"
echo "Running product update script..."
cd "$(dirname "$0")"
node update-product.js

echo ""
echo -e "${BLUE}🧪 Step 3: Running Comprehensive System Test${NC}"
echo "-----------------------------------------------"
./test-system.sh

echo ""
echo -e "${BLUE}📋 Step 4: Final Manual Checks${NC}"
echo "--------------------------------"
echo ""
echo "Please manually verify the following:"
echo ""
echo "1. Frontend URLs:"
echo "   - Home: https://glovia.com.np"
echo "   - Products: https://glovia.com.np/products"
echo "   - Product Detail: https://glovia.com.np/products/derma-facewash"
echo "   - Admin: https://glovia.com.np/admin"
echo ""
echo "2. Test User Flow:"
echo "   a. Register new account"
echo "   b. Verify email with OTP"
echo "   c. Browse products"
echo "   d. Add to cart"
echo "   e. Complete checkout"
echo ""
echo "3. Test Admin Flow:"
echo "   a. Login: superadmin@glovia.com.np / SuperAdmin123!"
echo "   b. View dashboard"
echo "   c. Create a product"
echo "   d. Manage orders"
echo "   e. Update settings"
echo ""

read -p "Have you completed the manual checks? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo ""
  echo -e "${GREEN}🎉 CONGRATULATIONS!${NC}"
  echo "==================="
  echo ""
  echo -e "${GREEN}✓ Glovia Nepal is now PRODUCTION READY!${NC}"
  echo ""
  echo "Your e-commerce platform is live at:"
  echo -e "${BLUE}🌐 https://glovia.com.np${NC}"
  echo ""
  echo "Admin panel:"
  echo -e "${BLUE}⚙️  https://glovia.com.np/admin${NC}"
  echo ""
  echo "Next Steps:"
  echo "1. ✅ Set up monitoring and analytics"
  echo "2. ✅ Configure email notifications"
  echo "3. ✅ Set up database backups"
  echo "4. ✅ Add more products"
  echo "5. ✅ Configure payment gateway credentials"
  echo "6. ✅ Set up customer support"
  echo ""
  echo "Good luck with your launch! 🚀"
  echo ""
else
  echo ""
  echo -e "${YELLOW}⚠️  Please complete the manual checks and run this script again.${NC}"
  echo ""
fi

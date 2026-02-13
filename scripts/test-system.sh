#!/bin/bash

# Glovia System Test Script
# Tests all major API endpoints and functionality

API_URL="${API_URL:-https://backend-glovia.vercel.app/api/v1}"
FRONTEND_URL="${FRONTEND_URL:-https://glovia.com.np}"

echo "🔍 GLOVIA NEPAL - COMPREHENSIVE SYSTEM TEST"
echo "=========================================="
echo "API URL: $API_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local expected_status="$4"
  local headers="$5"
  local data="$6"
  
  echo -n "Testing: $name... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" -H "$headers" "$API_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" -H "$headers" -H "Content-Type: application/json" -d "$data" "$API_URL$endpoint")
  fi
  
  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $status)"
    echo "Response: $body"
    ((FAILED++))
    return 1
  fi
}

echo "📋 1. PUBLIC ENDPOINTS"
echo "----------------------"
test_endpoint "Get Categories" "GET" "/categories" "200"
test_endpoint "Get Products" "GET" "/products" "200"
test_endpoint "Get Featured Products" "GET" "/products/featured?limit=4" "200"
test_endpoint "Get Best Sellers" "GET" "/products/best-sellers?limit=4" "200"
test_endpoint "Get Brands" "GET" "/brands" "200"
test_endpoint "Get Banners" "GET" "/banners" "200"
test_endpoint "Get Blogs" "GET" "/blogs" "200"
echo ""

echo "🔐 2. AUTHENTICATION"
echo "--------------------"
# Test login
LOGIN_RESPONSE=$(curl -s -X POST -H "Content-Type: application/json" \
  -d '{"email":"superadmin@glovia.com.np","password":"SuperAdmin123!"}' \
  "$API_URL/auth/login")

TOKEN=$(echo "$LOGIN_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('accessToken', ''))" 2>/dev/null)

if [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ PASS${NC} SuperAdmin Login"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} SuperAdmin Login"
  ((FAILED++))
fi

test_endpoint "Get Profile" "GET" "/auth/me" "200" "Authorization: Bearer $TOKEN"
echo ""

echo "🛒 3. CART & WISHLIST (Protected)"
echo "----------------------------------"
test_endpoint "Get Cart" "GET" "/cart" "200" "Authorization: Bearer $TOKEN"
test_endpoint "Get Wishlist" "GET" "/wishlist" "200" "Authorization: Bearer $TOKEN"
echo ""

echo "⚙️  4. ADMIN ENDPOINTS"
echo "---------------------"
test_endpoint "Get Dashboard" "GET" "/admin/dashboard" "200" "Authorization: Bearer $TOKEN"
test_endpoint "Get All Users" "GET" "/admin/users?page=1&limit=10" "200" "Authorization: Bearer $TOKEN"
test_endpoint "Get All Orders" "GET" "/admin/orders" "200" "Authorization: Bearer $TOKEN"
test_endpoint "Get Delivery Settings" "GET" "/admin/settings/delivery" "200" "Authorization: Bearer $TOKEN"
test_endpoint "Get Announcement" "GET" "/admin/settings/announcement" "200" "Authorization: Bearer $TOKEN"
echo ""

echo "🎯 5. PRODUCT OPERATIONS"
echo "------------------------"
# Test product by slug
PRODUCT_RESPONSE=$(curl -s "$API_URL/products/derma-facewash")
PRODUCT_NAME=$(echo "$PRODUCT_RESPONSE" | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('name', 'NOT_FOUND'))" 2>/dev/null)

if [ "$PRODUCT_NAME" = "Derma Facewash" ]; then
  echo -e "${GREEN}✓ PASS${NC} Get Product by Slug"
  ((PASSED++))
else
  echo -e "${RED}✗ FAIL${NC} Get Product by Slug (Got: $PRODUCT_NAME)"
  ((FAILED++))
fi

# Test products by category
CATEGORY_PRODUCTS=$(curl -s "$API_URL/products?categoryId=698f7f92077f39ad60a91c3c")
PRODUCT_COUNT=$(echo "$CATEGORY_PRODUCTS" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))" 2>/dev/null)

if [ "$PRODUCT_COUNT" -gt "0" ]; then
  echo -e "${GREEN}✓ PASS${NC} Get Products by Category (Found: $PRODUCT_COUNT)"
  ((PASSED++))
else
  echo -e "${YELLOW}⚠ WARN${NC} No products in Skincare category (deployment may be pending)"
  ((FAILED++))
fi
echo ""

echo "📱 6. FRONTEND ROUTES"
echo "---------------------"
check_frontend() {
  local name="$1"
  local path="$2"
  
  echo -n "Checking: $name... "
  status=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL$path")
  
  if [ "$status" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC} (HTTP $status)"
    ((PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (HTTP $status)"
    ((FAILED++))
  fi
}

check_frontend "Home Page" "/"
check_frontend "Products Page" "/products"
check_frontend "Skincare Category" "/products?category=skincare"
check_frontend "Login Page" "/auth/login"
check_frontend "Register Page" "/auth/register"
check_frontend "Admin Dashboard" "/admin"
check_frontend "Product Detail" "/products/derma-facewash"
echo ""

echo "=========================================="
echo "📊 TEST RESULTS"
echo "=========================================="
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
  echo "System is ready for production!"
  exit 0
else
  echo -e "${YELLOW}⚠️  Some tests failed. Review above for details.${NC}"
  echo ""
  echo "Common issues:"
  echo "- Vercel deployment may still be in progress (wait 2-3 minutes)"
  echo "- Product not showing: Run update-product.js script"
  echo "- Authentication errors: Check MongoDB connection"
  exit 1
fi

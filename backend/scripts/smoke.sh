#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# API smoke test for the Lumera Home backend.
#
#   ./scripts/smoke.sh [base-url]      # default http://localhost:4000/api
#
# Exercises the public surface, every authenticated staff endpoint, and one
# create/edit/delete round-trip per writable resource. Exits non-zero if any
# request does not return the status it is expected to.
#
# The query string is part of the path argument — pass the whole thing:
#   req admin GET '/products?pageSize=5&sortBy=name'
# ---------------------------------------------------------------------------
set -uo pipefail

BASE="${1:-http://localhost:4000/api}"
JAR_ADMIN="$(mktemp)"
JAR_STAFF="$(mktemp)"
JAR_CUST="$(mktemp)"
JAR_ANON="$(mktemp)"
TMPBODY="$(mktemp)"
TMPCODE="$(mktemp)"
trap 'rm -f "$JAR_ADMIN" "$JAR_STAFF" "$JAR_CUST" "$JAR_ANON" "$TMPBODY" "$TMPCODE"' EXIT

PASS=0
FAIL=0
FAILED=()

csrf() { grep -w csrf_token "$1" 2>/dev/null | awk '{print $NF}' | tail -1; }

# req <jar> <method> <path-with-query> [json-body] [expected-status-regex]
req() {
  local jar="$1" method="$2" path="$3" body="${4:-}" expect="${5:-^2}"

  local args=(-s -o "$TMPBODY" -w '%{http_code}' -b "$jar" -c "$jar"
              -H "x-csrf-token: $(csrf "$jar")" -X "$method" "$BASE$path")
  if [ -n "$body" ]; then
    args+=(-H 'Content-Type: application/json' -d "$body")
  fi

  local code
  code="$(curl "${args[@]}")"

  if [[ "$code" =~ $expect ]]; then
    PASS=$((PASS + 1))
    printf '  \033[32mok\033[0m   %-6s %-46s %s\n' "$method" "${path%%\?*}" "$code"
  else
    FAIL=$((FAIL + 1))
    FAILED+=("$method $path -> $code (expected $expect)  $(head -c 180 "$TMPBODY" | tr -d '\n')")
    printf '  \033[31mFAIL\033[0m %-6s %-46s %s  %s\n' "$method" "${path%%\?*}" "$code" \
      "$(head -c 180 "$TMPBODY" | tr -d '\n')"
  fi
}

login() {
  local jar="$1" email="$2" password="$3"
  rm -f "$jar"
  local seed
  seed="$(curl -s -o /dev/null -D - -c "$jar" "$BASE/settings/public" \
          | grep -i '^x-csrf-token' | tr -d '\r' | awk '{print $2}')"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' -b "$jar" -c "$jar" \
          -H 'Content-Type: application/json' -H "x-csrf-token: $seed" \
          -X POST "$BASE/auth/login" \
          -d "{\"email\":\"$email\",\"password\":\"$password\"}")"
  if [[ "$code" == "200" ]]; then
    PASS=$((PASS + 1))
    printf '  \033[32mok\033[0m   signed in as %s\n' "$email"
  else
    FAIL=$((FAIL + 1))
    FAILED+=("login $email -> $code")
    printf '  \033[31mFAIL\033[0m login %s -> %s\n' "$email" "$code"
  fi
}

section() { printf '\n\033[1m%s\033[0m\n' "$1"; }

section 'Health and the public storefront'
req "$JAR_ANON" GET /health
req "$JAR_ANON" GET /settings/public
req "$JAR_ANON" GET '/products/browse?pageSize=5&sortBy=name&sortDir=asc'
req "$JAR_ANON" GET '/products/browse?featured=true&in_stock=true&pageSize=5'
req "$JAR_ANON" GET '/products/browse?category_id=1&min_price=1000&max_price=200000'
req "$JAR_ANON" GET '/categories/tree'
req "$JAR_ANON" GET '/brands/all'
req "$JAR_ANON" POST /coupons/validate '{"code":"WELCOME10","cart_total":50000}'

section 'Authentication and account'
login "$JAR_ADMIN" 'admin@lumerahome.com' 'Admin@123'
login "$JAR_STAFF" 'staff@lumerahome.com' 'Staff@123'
login "$JAR_CUST"  'maria.reyes@example.com' 'Customer@123'
req "$JAR_CUST"  GET /auth/me
req "$JAR_CUST"  GET /auth/account
req "$JAR_CUST"  GET '/auth/login-history?limit=5'
req "$JAR_CUST"  GET '/auth/sessions?pageSize=5'
req "$JAR_CUST"  GET /auth/addresses
req "$JAR_CUST"  PATCH /auth/profile '{"phone":"+63 917 300 1199"}'

section 'Dashboard'
req "$JAR_ADMIN" GET /dashboard
req "$JAR_ADMIN" GET '/dashboard?days=30'
req "$JAR_ADMIN" GET '/dashboard/calendar?days=30'
req "$JAR_ADMIN" GET '/dashboard/sales-analytics?days=30'
req "$JAR_STAFF" GET /dashboard

section 'Products'
req "$JAR_ADMIN" GET /products/stats
req "$JAR_ADMIN" GET /products/form-options
req "$JAR_ADMIN" GET '/products?pageSize=5&sortBy=name&sortDir=asc'
req "$JAR_ADMIN" GET '/products?search=sofa&pageSize=5'
req "$JAR_ADMIN" GET '/products?status=active&pageSize=5'
req "$JAR_ADMIN" GET '/products?low_stock=true&pageSize=5'
req "$JAR_ADMIN" GET '/products?out_of_stock=true&pageSize=5'
req "$JAR_ADMIN" GET '/products?category_id=1&brand_id=1&featured=true&pageSize=5'
req "$JAR_ADMIN" GET '/products?min_price=1000&max_price=90000&pageSize=5'
req "$JAR_ADMIN" GET '/products/inventory-logs?pageSize=5'
req "$JAR_ADMIN" GET '/products/export?format=csv'
req "$JAR_ADMIN" GET '/products/export?format=json'
req "$JAR_ADMIN" POST /products '{"name":"Smoke Test Lamp","sku":"SMOKE-LAMP-1","category_id":1,"brand_id":1,"price":"1500.00","stock_quantity":10,"minimum_stock":2,"short_description":"Created by the smoke test.","description":"Created by the smoke test.","status":"active"}' '^201$'
# Products created by this script land at id > 53; 54 is the one above.
req "$JAR_ADMIN" GET /products/54
req "$JAR_ADMIN" GET /products/54/images
req "$JAR_ADMIN" GET /products/54/specifications
req "$JAR_ADMIN" PUT /products/54 '{"short_description":"Updated by the smoke test."}'
req "$JAR_ADMIN" PUT /products/54/specifications '{"specifications":[{"attribute_name":"Finish","attribute_value":"Matte black"}]}'
req "$JAR_ADMIN" POST /products/54/stock '{"type":"stock_in","quantity":5,"remarks":"smoke test restock","reference":"PO-SMOKE"}'
req "$JAR_ADMIN" GET '/products?search=SMOKE-LAMP-1' '{}' '^200$'
req "$JAR_ADMIN" DELETE /products/54 '' '^204$'

section 'Categories and brands'
req "$JAR_ADMIN" GET /categories
req "$JAR_ADMIN" GET /categories/tree
req "$JAR_ADMIN" GET '/categories?status=active&parent=1'
req "$JAR_ADMIN" GET '/categories/export?format=csv'
req "$JAR_ADMIN" POST /categories '{"name":"Smoke Test Category","slug":"smoke-test-category","description":"temp"}' '^201$'
req "$JAR_ADMIN" PUT /categories/1 '{"description":"Updated by the smoke test."}'
req "$JAR_ADMIN" GET /brands
req "$JAR_ADMIN" GET /brands/all
req "$JAR_ADMIN" GET '/brands?status=active&pageSize=5'
req "$JAR_ADMIN" POST /brands '{"name":"Smoke Brand","slug":"smoke-brand"}' '^201$'
req "$JAR_ADMIN" PUT /brands/1 '{"description":"Updated by the smoke test."}'

section 'Orders'
req "$JAR_STAFF" GET /orders/stats
req "$JAR_STAFF" GET '/orders?pageSize=5&sortBy=created_at&sortDir=desc'
req "$JAR_STAFF" GET '/orders?status=Pending&pageSize=5'
req "$JAR_STAFF" GET '/orders?payment_status=Paid&payment_method=cod&pageSize=5'
req "$JAR_STAFF" GET '/orders?customer_id=4&pageSize=5'
req "$JAR_STAFF" GET '/orders?from=2026-01-01&to=2026-12-31&pageSize=5'
req "$JAR_STAFF" GET '/orders?min_total=100&max_total=900000&pageSize=5'
req "$JAR_STAFF" GET '/orders/export?format=csv'
req "$JAR_STAFF" GET '/orders/export?format=json'
req "$JAR_STAFF" GET /orders/1
req "$JAR_STAFF" GET /orders/1/history
req "$JAR_STAFF" GET /orders/1/receipt
req "$JAR_STAFF" PATCH /orders/1/status '{"order_status":"Processing","note":"smoke test"}'
req "$JAR_STAFF" POST /orders/1/history '{"status":"Processing","note":"smoke test note"}' '^201$'
req "$JAR_STAFF" PUT /orders/1 '{"notes":"Updated by the smoke test."}'

section 'Users'
req "$JAR_ADMIN" GET /users/stats
req "$JAR_ADMIN" GET '/users?pageSize=5'
req "$JAR_ADMIN" GET '/users?role=staff&status=active&pageSize=5'
req "$JAR_ADMIN" GET '/users?search=admin&pageSize=5'
req "$JAR_ADMIN" GET '/users?pageSize=5&sortBy=full_name&sortDir=asc'
req "$JAR_ADMIN" GET /users/1
req "$JAR_ADMIN" GET '/users/activity?pageSize=5'
req "$JAR_ADMIN" GET /users/4/orders
req "$JAR_ADMIN" GET /users/4/addresses
req "$JAR_ADMIN" GET /users/4/summary
req "$JAR_ADMIN" POST /users '{"full_name":"Smoke User","email":"smoke.user@example.com","password":"Smoke@1234","role":"staff","phone":"+63 900 000 0000"}' '^201$'
req "$JAR_ADMIN" PUT /users/2 '{"full_name":"Smoke Staff Renamed"}'
req "$JAR_ADMIN" PATCH /users/2/role '{"role":"staff"}'
req "$JAR_ADMIN" PATCH /users/2/status '{"status":"active"}'
req "$JAR_ADMIN" DELETE /users/28 '' '^204$'

section 'Customers'
req "$JAR_STAFF" GET /customers/stats
req "$JAR_STAFF" GET '/customers?pageSize=5'
req "$JAR_STAFF" GET '/customers?status=active&pageSize=5'
req "$JAR_STAFF" GET /customers/4
req "$JAR_STAFF" GET /customers/4/orders
req "$JAR_STAFF" GET /customers/4/addresses
req "$JAR_STAFF" GET '/customers/4/login-history'
req "$JAR_ADMIN" PUT /customers/4 '{"full_name":"Maria Clara Reyes"}'

section 'Coupons'
req "$JAR_STAFF" GET '/coupons?pageSize=5'
req "$JAR_STAFF" GET '/coupons?status=active&type=percentage&pageSize=5'
req "$JAR_STAFF" GET '/coupons/export?format=csv'
req "$JAR_STAFF" GET /coupons/1
req "$JAR_STAFF" GET '/coupons/1/usages?pageSize=5'
req "$JAR_STAFF" POST /coupons '{"code":"SMOKE15","type":"percentage","value":15,"minimum_order":"1000.00","usage_limit":5,"start_date":"2026-01-01","end_date":"2027-01-01","status":"active"}' '^201$'
req "$JAR_STAFF" PUT /coupons/1 '{"description":"Updated by the smoke test."}'

section 'Reviews'
req "$JAR_STAFF" GET /reviews/stats
req "$JAR_STAFF" GET '/reviews?pageSize=5'
req "$JAR_STAFF" GET '/reviews?status=approved&pageSize=5'
req "$JAR_STAFF" GET '/reviews?rating=5&pageSize=5'
req "$JAR_STAFF" GET '/reviews?product_id=1&pageSize=5'
req "$JAR_STAFF" GET '/reviews/export?format=csv'
req "$JAR_STAFF" GET /reviews/1
req "$JAR_STAFF" PATCH /reviews/1/status '{"status":"approved"}'

section 'Settings'
req "$JAR_ADMIN" GET /settings
req "$JAR_ADMIN" GET /settings/grouped
req "$JAR_ADMIN" GET '/settings?group=payment'
req "$JAR_ADMIN" GET /settings/1
req "$JAR_ADMIN" PUT '/settings/bulk' '{"settings":{"site_tagline":"Updated by the smoke test."}}'

section 'Files and notifications'
req "$JAR_ADMIN" GET /files/stats
req "$JAR_ADMIN" GET /files/backups
req "$JAR_ADMIN" GET '/files?pageSize=5'
req "$JAR_ADMIN" GET '/files?category=image&pageSize=5'
req "$JAR_ADMIN" GET /notifications
req "$JAR_ADMIN" GET /notifications/unread-count
req "$JAR_ADMIN" GET '/notifications/staff/all?pageSize=5'
req "$JAR_ADMIN" POST /notifications/broadcast '{"title":"Smoke test","message":"Sent by the smoke test.","type":"info"}'

section 'Cart and wishlist (customer)'
req "$JAR_CUST" DELETE /cart '' '^2'
req "$JAR_CUST" GET /cart
req "$JAR_CUST" GET /cart/badge
req "$JAR_CUST" POST /cart/items '{"product_id":3,"quantity":2}' '^201$'
req "$JAR_CUST" GET '/cart/summary?coupon=WELCOME10'
req "$JAR_CUST" POST /cart/coupon '{"code":"WELCOME10","cart_total":50000}'
req "$JAR_CUST" GET /wishlist
req "$JAR_CUST" POST /wishlist '{"product_id":1}' '^201$'
req "$JAR_CUST" GET /wishlist/1
req "$JAR_CUST" POST /wishlist/1/to-cart '{}' '^2'
req "$JAR_CUST" DELETE /wishlist/1

section 'Checkout'
req "$JAR_CUST" POST /orders/checkout '{"shipping_address_id":1,"payment_method":"cod","coupon_code":"WELCOME10","notes":"smoke test order"}' '^201$'
req "$JAR_CUST" GET '/orders?pageSize=5'

section 'Authorisation (negative cases)'
req "$JAR_ANON"  GET  '/users?pageSize=1' '' '^401$'
req "$JAR_ANON"  GET  /dashboard '' '^401$'
req "$JAR_CUST"  GET  /settings/grouped '' '^403$'
req "$JAR_CUST"  GET  '/users?pageSize=1' '' '^403$'
req "$JAR_CUST"  GET  /customers/stats '' '^403$'
req "$JAR_STAFF" GET  '/users/4/summary' '' '^403$'
req "$JAR_STAFF" DELETE '/users/30' '' '^403$'
# A CSRF token is mandatory on every mutation.
code="$(curl -s -o /dev/null -w '%{http_code}' -b "$JAR_CUST" -X DELETE "$BASE/cart")"
if [[ "$code" == "403" ]]; then
  PASS=$((PASS + 1)); printf '  \033[32mok\033[0m   mutation without a CSRF token is rejected (%s)\n' "$code"
else
  FAIL=$((FAIL + 1)); FAILED+=("csrf-less DELETE /cart -> $code")
  printf '  \033[31mFAIL\033[0m mutation without a CSRF token returned %s\n' "$code"
fi

# ---------------------------------------------------------------------------
printf '\n\033[1mResult: %d passed, %d failed\033[0m\n' "$PASS" "$FAIL"
if [ "$FAIL" -gt 0 ]; then
  printf 'Failures:\n'
  for f in "${FAILED[@]}"; do printf '  - %s\n' "$f"; done
  exit 1
fi

#!/usr/bin/env bash
# Print the real shape of every important API payload so the frontend types can
# be checked against them rather than guessed.
set -uo pipefail
API="http://localhost:4000/api"
JAR="$(mktemp -t shapes.jar)"

curl -s -c "$JAR" "$API/settings/public" -o /dev/null
CSRF=$(grep csrf_token "$JAR" | awk '{print $7}')
curl -s -b "$JAR" -c "$JAR" -X POST "$API/auth/login" \
  -H 'Content-Type: application/json' -H "x-csrf-token: $CSRF" \
  -d '{"email":"admin@lumerahome.com","password":"Admin@123"}' -o /dev/null
CSRF=$(grep csrf_token "$JAR" | awk '{print $7}')

shape() {
  local name="$1" path="$2"
  echo "────────────── $name  ($path)"
  curl -s -b "$JAR" -H "x-csrf-token: $CSRF" "$API$path" | python3 -c '
import json, sys

def describe(v, depth=0):
    if isinstance(v, dict):
        return {k: describe(x, depth + 1) for k, x in list(v.items())[:40]}
    if isinstance(v, list):
        return [describe(v[0], depth + 1)] if v else []
    if isinstance(v, bool) or v is None:
        return f"<{type(v).__name__}>"
    if isinstance(v, (int, float)):
        return f"<{type(v).__name__}>"
    return f"<str:{str(v)[:24]}>"

try:
    body = json.load(sys.stdin)
except Exception as exc:
    print("  !! not JSON:", exc)
    sys.exit()
print(json.dumps(describe(body), indent=1)[:4200])
'
}

shape "dashboard"          "/dashboard?days=14"
shape "products stats"     "/products/stats"
shape "products list"      "/products?page_size=2"
shape "product detail"     "/products/1"
shape "orders stats"       "/orders/stats"
shape "orders list"        "/orders?page_size=2"
shape "order detail"       "/orders/1"
shape "customers list"     "/customers?page_size=2"
shape "customers stats"    "/customers/stats"
shape "users list"         "/users?page_size=2"
shape "categories list"    "/categories?page_size=2"
shape "brands list"        "/brands?page_size=2"
shape "coupons list"       "/coupons?page_size=2"
shape "reviews list"       "/reviews?page_size=2"
shape "reviews stats"      "/reviews/stats"
shape "files list"         "/files?page_size=2"
shape "files stats"        "/files/stats"
shape "settings"           "/settings"
shape "notifications"      "/notifications?page_size=2"
shape "cart summary"       "/cart/summary"
shape "wishlist"           "/wishlist"
shape "calendar"           "/dashboard/calendar?days=10"
shape "sales analytics"    "/dashboard/sales-analytics?days=10"

rm -f "$JAR"

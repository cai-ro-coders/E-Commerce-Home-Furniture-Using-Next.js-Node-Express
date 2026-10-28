#!/usr/bin/env bash
# Shape dump for the endpoints the first pass missed.
set -uo pipefail
API="http://localhost:4000/api"
JAR="$(mktemp -t shapes2.jar)"
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
def d(v):
    if isinstance(v, dict):
        return {k: d(x) for k, x in list(v.items())[:40]}
    if isinstance(v, list):
        return [d(v[0])] if v else []
    if isinstance(v, bool) or v is None:
        return f"<{type(v).__name__}>"
    if isinstance(v, (int, float)):
        return f"<{type(v).__name__}>"
    s = str(v)
    return f"<str:{s[:30]}>"
try:
    body = json.load(sys.stdin)
except Exception as exc:
    print("  !! not JSON:", exc); sys.exit()
print(json.dumps(d(body), indent=1)[:3000])
'
}

shape "settings grouped"   "/settings/grouped"
shape "settings public"    "/settings/public"
shape "product form-opts"  "/products/form-options"
shape "inventory logs"     "/products/inventory-logs?page_size=1"
shape "products export"    "/products/export"
shape "users activity"     "/users/activity?page_size=1"
shape "user summary"       "/users/1/summary"
shape "coupon detail"      "/coupons/1"
shape "coupon usages"      "/coupons/1/usages"
shape "review detail"      "/reviews/1"
shape "file detail"        "/files/1"
shape "auth account"       "/auth/account"
shape "login history"      "/auth/login-history"
shape "sessions"           "/auth/sessions"
shape "cart"               "/cart"
shape "unread count"       "/notifications/unread-count"
shape "staff notifs"       "/notifications/staff/all?page_size=1"
shape "browse"             "/products/browse?page_size=1"
shape "browse detail"      "/products/browse/nordicaline-bergen-3-seater-sofa"
shape "categories tree"    "/categories/tree"
shape "orders export"      "/orders/export"
shape "calendar"           "/dashboard/calendar?days=3"
shape "customers me"       "/customers/1"
shape "addresses"          "/auth/addresses"

rm -f "$JAR"

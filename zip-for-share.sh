#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  zip-for-share.sh — Package MobileInventory for sharing
#  Excludes node_modules, build outputs, OS junk
#  Result: MobileInventory-poc.zip (email-safe size)
# ─────────────────────────────────────────────────────────────

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT="$SCRIPT_DIR/../MobileInventory-poc.zip"

echo "📦 Packaging MobileInventory for sharing..."

# Remove old zip if exists
rm -f "$OUTPUT"

cd "$SCRIPT_DIR/.."

zip -r "$OUTPUT" MobileInventory \
  --exclude "MobileInventory/server/node_modules/*" \
  --exclude "MobileInventory/server/public/*" \
  --exclude "MobileInventory/webapp/node_modules/*" \
  --exclude "MobileInventory/webapp/.angular/*" \
  --exclude "MobileInventory/webapp/dist/*" \
  --exclude "MobileInventory/**/.DS_Store" \
  --exclude "MobileInventory/**/*.log" \
  --exclude "MobileInventory/**/Thumbs.db"

SIZE=$(du -sh "$OUTPUT" | cut -f1)
echo ""
echo "✅ Done! File: $OUTPUT"
echo "   Size: $SIZE"
echo ""
echo "📋 Recipient instructions:"
echo "   1. Unzip the file"
echo "   2. Edit MobileInventory/server/.env with correct Oracle DB details"
echo "   3. cd MobileInventory && ./setup-and-run.sh"
echo "   --- OR for OpenShift ---"
echo "   4. cd MobileInventory && docker build -t devicehub . && oc apply -f openshift-deploy.yaml"

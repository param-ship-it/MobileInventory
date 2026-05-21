#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  setup-and-run.sh — First-time setup on a new machine
#  Run this ONCE after unzipping on a new PC
# ─────────────────────────────────────────────────────────────

set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo ""
echo "═══════════════════════════════════════════"
echo "  DeviceHub — Setup & Run"
echo "═══════════════════════════════════════════"

# 1. Check Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js not found. Install from https://nodejs.org (v18+) and re-run."
  exit 1
fi
NODE_VER=$(node -v)
echo "✅ Node.js: $NODE_VER"

# 2. Install backend deps
echo ""
echo "📦 Installing backend dependencies..."
cd "$SCRIPT_DIR/server"
npm install

# 3. Install frontend deps and build
echo ""
echo "📦 Installing frontend dependencies..."
cd "$SCRIPT_DIR/webapp"
npm install --legacy-peer-deps

echo ""
echo "🔨 Building Ionic frontend..."
npx ionic build

echo ""
echo "🚀 Starting DeviceHub server..."
echo "   App will be at: http://localhost:3000"
echo "   Login: admin / Admin@123"
echo ""
cd "$SCRIPT_DIR/server"
node server.js

#!/bin/bash

# ============================================
# QUICK DEPLOYMENT - ONE COMMAND
# ============================================
# Usage: bash quick-deploy.sh

set -e

echo "🚀 QUICK DEPLOYMENT STARTED"
echo ""
echo "This script will:"
echo "1. Build the application"
echo "2. Create backups"
echo "3. Start/restart the application"
echo "4. Verify health"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

# Build
echo "🔨 Building..."
npm run build

# Backup
echo "💾 Backing up..."
mkdir -p backups/$(date +%Y%m%d_%H%M%S)
cp -r dist backups/$(date +%Y%m%d_%H%M%S)/ 2>/dev/null || true

# Stop existing
echo "⏹️  Stopping existing process..."
pm2 delete glovia-backend 2>/dev/null || true

# Start
echo "▶️  Starting application..."
pm2 start dist/main.js \
  --name "glovia-backend" \
  --instances max \
  --max-memory-restart 300M

# Save
pm2 save

# Wait for startup
sleep 3

# Health check
echo "🏥 Checking health..."
if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Application is healthy!"
    echo ""
    echo "📊 Status:"
    pm2 status
    echo ""
    echo "📊 Monitor with: pm2 monit"
    echo "📊 View logs: pm2 logs glovia-backend"
else
    echo "❌ Health check failed"
    echo "📊 Logs:"
    pm2 logs glovia-backend --lines 20
    exit 1
fi

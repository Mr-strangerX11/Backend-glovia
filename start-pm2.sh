#!/bin/bash

# ============================================
# GLOVIA BACKEND - PM2 STARTUP SCRIPT
# ============================================
# This script starts the application using PM2
# PM2 provides process management, monitoring, and auto-restart

echo "🚀 Starting Glovia Backend with PM2..."

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2 globally..."
    npm install -g pm2
fi

# Stop existing process if any
pm2 delete glovia-backend 2>/dev/null || true

# Start application
echo "▶️  Starting application..."
pm2 start dist/main.js \
  --name "glovia-backend" \
  --instances max \
  --exec-mode cluster \
  --max-memory-restart 300M \
  --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
  --log /var/log/glovia-backend.log \
  --error-file /var/log/glovia-backend-error.log

# Save PM2 configuration
pm2 save

# Configure PM2 to auto-start on reboot
pm2 startup

echo "✅ Application started"
echo ""
echo "📊 Monitor with:"
echo "   pm2 monit"
echo "   pm2 logs glovia-backend"
echo "   pm2 status"

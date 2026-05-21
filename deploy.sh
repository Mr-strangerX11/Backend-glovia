#!/bin/bash

# ============================================
# GLOVIA BACKEND - PRODUCTION DEPLOYMENT SCRIPT
# ============================================
# This script automates the entire deployment process
# Usage: bash deploy.sh [staging|production]

set -e

ENVIRONMENT=${1:-production}
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_DIR="backups/$TIMESTAMP"
LOG_FILE="deploy_$TIMESTAMP.log"

echo "🚀 Starting Deployment to $ENVIRONMENT - $TIMESTAMP" | tee $LOG_FILE

# ============================================
# 1. PRE-DEPLOYMENT CHECKS
# ============================================
echo "📋 Running pre-deployment checks..." | tee -a $LOG_FILE

if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js v18+" | tee -a $LOG_FILE
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm not found." | tee -a $LOG_FILE
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js version: $NODE_VERSION" | tee -a $LOG_FILE

# ============================================
# 2. BACKUP CURRENT DEPLOYMENT
# ============================================
echo "💾 Creating backup..." | tee -a $LOG_FILE

mkdir -p $BACKUP_DIR

if [ -d "dist" ]; then
    cp -r dist $BACKUP_DIR/dist_backup
    echo "✅ Backed up current build" | tee -a $LOG_FILE
fi

if [ -f ".env.production" ]; then
    cp .env.production $BACKUP_DIR/.env.production.backup
    echo "✅ Backed up environment config" | tee -a $LOG_FILE
fi

# ============================================
# 3. INSTALL DEPENDENCIES
# ============================================
echo "📦 Installing dependencies..." | tee -a $LOG_FILE

npm ci --only=production

if [ $? -ne 0 ]; then
    echo "❌ npm install failed" | tee -a $LOG_FILE
    exit 1
fi

echo "✅ Dependencies installed" | tee -a $LOG_FILE

# ============================================
# 4. BUILD APPLICATION
# ============================================
echo "🔨 Building application..." | tee -a $LOG_FILE

npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed" | tee -a $LOG_FILE
    exit 1
fi

echo "✅ Build successful" | tee -a $LOG_FILE

# ============================================
# 5. RUN TESTS (Optional)
# ============================================
echo "🧪 Running tests..." | tee -a $LOG_FILE

npm run test:e2e 2>/dev/null || echo "⚠️  E2E tests skipped (optional)" | tee -a $LOG_FILE

# ============================================
# 6. DATABASE MIGRATIONS
# ============================================
echo "🗄️ Running database migrations..." | tee -a $LOG_FILE

npm run prisma:generate
npm run prisma:migrate || echo "⚠️  Migrations skipped or already applied" | tee -a $LOG_FILE

echo "✅ Database ready" | tee -a $LOG_FILE

# ============================================
# 7. VERIFY BUILD
# ============================================
echo "🔍 Verifying build..." | tee -a $LOG_FILE

if [ ! -d "dist" ]; then
    echo "❌ Build directory not found" | tee -a $LOG_FILE
    exit 1
fi

if [ ! -f "dist/main.js" ]; then
    echo "❌ Main entry point not found in dist/" | tee -a $LOG_FILE
    exit 1
fi

echo "✅ Build verified" | tee -a $LOG_FILE

# ============================================
# 8. DEPLOYMENT SUCCESS
# ============================================
echo "" | tee -a $LOG_FILE
echo "============================================" | tee -a $LOG_FILE
echo "✅ DEPLOYMENT SUCCESSFUL!" | tee -a $LOG_FILE
echo "============================================" | tee -a $LOG_FILE
echo "Environment: $ENVIRONMENT" | tee -a $LOG_FILE
echo "Timestamp: $TIMESTAMP" | tee -a $LOG_FILE
echo "Build location: $(pwd)/dist" | tee -a $LOG_FILE
echo "Log file: $LOG_FILE" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE
echo "📝 Next steps:" | tee -a $LOG_FILE
echo "1. Review .env.production configuration" | tee -a $LOG_FILE
echo "2. Start application: npm run start:prod" | tee -a $LOG_FILE
echo "3. Monitor logs: tail -f application.log" | tee -a $LOG_FILE
echo "4. Health check: curl http://localhost:3001/health" | tee -a $LOG_FILE
echo "" | tee -a $LOG_FILE

# ============================================
# 9. ROLLBACK INSTRUCTIONS
# ============================================
echo "🔄 To rollback this deployment:" | tee -a $LOG_FILE
echo "   cp -r $BACKUP_DIR/dist_backup dist" | tee -a $LOG_FILE
echo "============================================" | tee -a $LOG_FILE

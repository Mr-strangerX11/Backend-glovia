#!/bin/bash

# OTP Authentication System Setup Script
# This script sets up the OTP auth system within the backend

set -e

echo "🔧 Setting up OTP Authentication System..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "✅ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env || true
    echo "⚠️  Please configure .env with your settings (SMTP credentials, MongoDB URL, etc.)"
fi

echo ""
echo "✅ OTP Authentication System setup complete!"
echo ""
echo "🚀 To start the OTP server:"
echo "   cd backend/python-services/otp-auth"
echo "   source venv/bin/activate"
echo "   python main.py"
echo ""
echo "📚 API Documentation will be available at:"
echo "   http://localhost:8000/docs"
echo ""

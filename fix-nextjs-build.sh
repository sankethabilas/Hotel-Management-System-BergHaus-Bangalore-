#!/bin/bash

# Fix Next.js Build Error Script
# Run this on your production server

echo "🔧 Fixing Next.js build error..."

# Navigate to frontend directory
cd /var/www/hms/frontend || exit 1

echo "📦 Stopping PM2 process..."
pm2 stop hms-frontend

echo "🗑️  Removing corrupted build..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .next/cache 2>/dev/null || true

echo "📥 Installing sharp for image optimization..."
npm install sharp

echo "🔨 Rebuilding Next.js application..."
npm run build

# Check if build succeeded
if [ -f ".next/prerender-manifest.json" ]; then
    echo "✅ Build successful! Prerender manifest exists."
else
    echo "❌ Build failed! Prerender manifest not found."
    echo "Please check the build output above for errors."
    exit 1
fi

echo "🚀 Starting PM2 process..."
pm2 start hms-frontend

echo "📊 Checking PM2 status..."
pm2 status

echo "📝 Recent logs:"
pm2 logs hms-frontend --lines 10 --nostream

echo ""
echo "✅ Done! Check the logs above for any errors."
echo "If you see errors, run: pm2 logs hms-frontend --lines 50"

